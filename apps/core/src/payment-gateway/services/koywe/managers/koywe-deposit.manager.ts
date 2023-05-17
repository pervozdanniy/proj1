import { KoyweCreateOrder, KoyweQuote } from '@/payment-gateway/types/koywe';
import { UserService } from '@/user/services/user.service';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConflictException } from '@nestjs/common/exceptions';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { Providers } from '~common/enum/providers';
import { CreateReferenceRequest, DepositRedirectData } from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { TransfersEntity } from '~svc/core/src/payment-gateway/entities/transfers.entity';
import { countriesData } from '../../../country/data';
import { VeriffDocumentEntity } from '../../../entities/veriff-document.entity';
import { KoyweMainManager, KoywePaymentMethod } from './koywe-main.manager';
import { KoyweTokenManager } from './koywe-token.manager';

export type KoyweReferenceParams = {
  wallet_address: string;
  asset_transfer_method_id: string;
  method?: KoywePaymentMethod;
};

@Injectable()
export class KoyweDepositManager {
  private readonly koywe_url: string;
  private readonly asset: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly koyweTokenManager: KoyweTokenManager,
    private readonly koyweMainManager: KoyweMainManager,
    @InjectRepository(TransfersEntity)
    private readonly depositEntityRepository: Repository<TransfersEntity>,
    @InjectRepository(VeriffDocumentEntity)
    private readonly documentRepository: Repository<VeriffDocumentEntity>,

    private userService: UserService,
    config: ConfigService<ConfigInterface>,
    @InjectRedis() private readonly redis: Redis,
  ) {
    const { koywe_url } = config.get('app');
    const { short } = config.get('asset');
    this.asset = short;
    this.koywe_url = koywe_url;
  }

  async createReference(
    depositParams: CreateReferenceRequest,
    transferParams: KoyweReferenceParams,
  ): Promise<DepositRedirectData> {
    const { amount, id } = depositParams;
    const { wallet_address, method } = transferParams;

    const userDetails = await this.userService.getUserInfo(id);
    await this.koyweTokenManager.getToken(userDetails.email);
    const { currency_type } = countriesData[userDetails.country_code];

    const quote = await this.createQuote({
      amount,
      currency: currency_type,
      method,
    });

    const document = await this.documentRepository.findOneBy({ user_id: id, status: 'approved' });
    if (!document) {
      throw new ConflictException('KYC is not completed');
    }

    const { orderId, providedAddress, providedAction } = await this.createOrder(
      quote.quoteId,
      userDetails.email,
      wallet_address,
      document.document_number,
    );

    const totalFee = quote.networkFee + quote.koyweFee;
    await this.depositEntityRepository.save(
      this.depositEntityRepository.create({
        user_id: id,
        uuid: orderId,
        type: 'deposit',
        amount: quote.amountIn.toFixed(2),
        provider: Providers.KOYWE,
        currency_type,
        status: 'waiting',
        fee: totalFee.toFixed(2),
      }),
    );
    const info = {
      amount: quote.amountIn.toFixed(2),
      currency: currency_type,
      rate: quote.exchangeRate.toFixed(4),
      fee: totalFee.toFixed(2),
    };
    if (providedAddress) {
      if (userDetails.country_code === 'MX') {
        return { url: providedAddress, info };
      }

      throw new ConflictException('Invalid flow params');
      // const parts = providedAddress.split('\n');

      // const paymentData: ReferenceData = {
      //   name: parts[0],
      //   account_number: parts[1],
      //   tax_id: parts[2],
      //   bank: parts[3],
      //   email: parts[4],
      //   amount: quote.amountIn.toFixed(2),
      //   currency_type,
      //   asset_transfer_method_id,
      //   wallet_address,
      // };

      // return { data: JSON.stringify({ paymentData, info }) };
    }
    if (providedAction) {
      return { url: providedAction, info };
    }
  }

  async createQuote(params: { amount: string; currency: string; method?: KoywePaymentMethod }): Promise<KoyweQuote> {
    try {
      const paymentMethodId = await this.koyweMainManager.getPaymentMethodId(params.currency, params.method ?? 'KHIPU');

      const formData = {
        symbolIn: params.currency,
        symbolOut: this.asset,
        amountOut: params.amount,
        paymentMethodId,
        executable: true,
      };

      const result = await lastValueFrom(this.httpService.post(`${this.koywe_url}/quotes`, formData));

      return result.data;
    } catch (e) {
      throw new GrpcException(Status.ABORTED, e.response.data.message, 400);
    }
  }

  async createOrder(
    quoteId: string,
    email: string,
    wallet_address: string,
    documentNumber: string,
  ): Promise<KoyweCreateOrder> {
    try {
      const token = await this.redis.get('koywe_token');
      const formData = {
        destinationAddress: wallet_address,
        quoteId,
        email,
        metadata: 'Deposit funds',
        documentNumber,
      };
      const headersRequest = {
        Authorization: `Bearer ${token}`,
      };

      const result = await lastValueFrom(
        this.httpService.post(`${this.koywe_url}/orders`, formData, { headers: headersRequest }),
      );

      return result.data;
    } catch (e) {
      throw new GrpcException(Status.ABORTED, e.response.data.message, 400);
    }
  }
}
