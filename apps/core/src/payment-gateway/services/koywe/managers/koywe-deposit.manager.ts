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
import { BankCredentialsData, DepositRedirectData } from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import {
  TransfersEntity,
  TransferStatus,
  TransferTypes,
} from '~svc/core/src/payment-gateway/entities/transfers.entity';
import { countriesData } from '../../../country/data';
import { CreateReferenceRequest } from '../../../interfaces/payment-gateway.interface';
import { FeeService } from '../../../modules/fee/fee.service';
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
    private readonly userService: UserService,
    private readonly feeService: FeeService,
    config: ConfigService<ConfigInterface>,
    @InjectRedis() private readonly redis: Redis,
  ) {
    const { koywe_url } = config.get('app');
    const { short } = config.get('asset');
    this.asset = short;
    this.koywe_url = koywe_url;
  }

  async createReference(request: CreateReferenceRequest, params: KoyweReferenceParams): Promise<BankCredentialsData> {
    const { amount_usd, user_id } = request;
    const { wallet_address, asset_transfer_method_id, method } = params;

    const userDetails = await this.userService.getUserInfo(user_id);
    const document = userDetails.documents?.find((d) => d.status === 'approved');
    if (!document?.person_id_number) {
      throw new ConflictException('KYC is not completed');
    }

    await this.koyweTokenManager.getToken(userDetails.email);
    const { currency_type } = countriesData[userDetails.country_code];
    const { total, fee: internalFee } = await this.feeService.calculate(amount_usd, userDetails.country_code);

    const quote = await this.createQuote({
      amount_usd: total.valueOf(),
      currency: currency_type,
      method,
    });

    const { providedAddress } = await this.createOrder(
      quote.quoteId,
      userDetails.email,
      wallet_address,
      document.person_id_number,
    );

    const totalFee = internalFee.mul(quote.exchangeRate).add(quote.networkFee).add(quote.koyweFee).valueOf();
    await this.depositEntityRepository.save(
      this.depositEntityRepository.create({
        user_id,
        uuid: asset_transfer_method_id,
        type: TransferTypes.DEPOSIT,
        amount: quote.amountIn,
        amount_usd,
        provider: Providers.KOYWE,
        currency_type,
        status: TransferStatus.PENDING,
        fee: totalFee,
        internal_fee_usd: internalFee.valueOf(),
      }),
    );
    const info = {
      amount: quote.amountIn,
      currency: currency_type,
      rate: quote.exchangeRate,
      fee: totalFee,
    };
    if (providedAddress) {
      return { info, bank: { account_number: providedAddress } };
    }
  }

  async createRedirectReference(
    depositParams: CreateReferenceRequest,
    transferParams: KoyweReferenceParams,
  ): Promise<DepositRedirectData> {
    const { amount_usd, user_id } = depositParams;
    const { wallet_address, asset_transfer_method_id, method } = transferParams;

    const userDetails = await this.userService.getUserInfo(user_id);
    const document = userDetails.documents?.find((d) => d.status === 'approved');
    if (!document?.person_id_number) {
      throw new ConflictException('KYC is not completed');
    }

    await this.koyweTokenManager.getToken(userDetails.email);
    const { currency_type } = countriesData[userDetails.country_code];
    const { total, fee: internalFee } = await this.feeService.calculate(amount_usd, userDetails.country_code);

    const quote = await this.createQuote({
      amount_usd: total.valueOf(),
      currency: currency_type,
      method,
    });

    const { providedAddress, providedAction } = await this.createOrder(
      quote.quoteId,
      userDetails.email,
      wallet_address,
      document.person_id_number,
    );

    const totalFee = internalFee.mul(quote.exchangeRate).add(quote.networkFee).add(quote.koyweFee).valueOf();
    await this.depositEntityRepository.save(
      this.depositEntityRepository.create({
        user_id,
        uuid: asset_transfer_method_id,
        type: TransferTypes.DEPOSIT,
        amount: quote.amountIn,
        amount_usd,
        provider: Providers.KOYWE,
        currency_type,
        status: TransferStatus.PENDING,
        fee: totalFee,
        internal_fee_usd: internalFee.valueOf(),
      }),
    );
    const info = {
      amount: quote.amountIn,
      currency: currency_type,
      rate: quote.exchangeRate,
      fee: totalFee,
    };
    if (providedAddress) {
      throw new ConflictException('Invalid flow params');
    }
    if (providedAction) {
      return { url: providedAction, info };
    }
  }

  async createQuote(params: {
    amount_usd: number;
    currency: string;
    method?: KoywePaymentMethod;
  }): Promise<KoyweQuote> {
    try {
      const paymentMethodId = await this.koyweMainManager.getPaymentMethodId(params.currency, params.method ?? 'KHIPU');
      const formData = {
        symbolIn: params.currency,
        symbolOut: this.asset,
        amountOut: params.amount_usd,
        paymentMethodId,
        executable: true,
      };

      const result = await lastValueFrom(this.httpService.post<KoyweQuote>(`${this.koywe_url}/quotes`, formData));

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
