import { BankAccountEntity } from '@/payment-gateway/entities/prime_trust/bank-account.entity';
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
import { TransferInfo, TransferMethodRequest } from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import {
  TransfersEntity,
  TransferStatus,
  TransferTypes,
} from '~svc/core/src/payment-gateway/entities/transfers.entity';
import { countriesData, CountryData } from '../../../country/data';
import { KoyweCreateOrder, KoyweQuote } from '../../../types/koywe';
import { KoyweMainManager } from './koywe-main.manager';
import { KoyweTokenManager } from './koywe-token.manager';

@Injectable()
export class KoyweWithdrawalManager {
  private readonly koywe_url: string;
  private readonly asset: string;
  constructor(
    private readonly koyweTokenManager: KoyweTokenManager,

    private readonly koyweMainManager: KoyweMainManager,
    private readonly httpService: HttpService,
    private userService: UserService,
    @InjectRepository(BankAccountEntity)
    private readonly bankAccountEntityRepository: Repository<BankAccountEntity>,
    @InjectRepository(TransfersEntity)
    private readonly transferRepository: Repository<TransfersEntity>,
    @InjectRedis() private readonly redis: Redis,

    config: ConfigService<ConfigInterface>,
  ) {
    const { koywe_url } = config.get('app');
    const { short } = config.get('asset');
    this.asset = short;
    this.koywe_url = koywe_url;
  }

  async makeWithdrawal(request: TransferMethodRequest): Promise<{ wallet: string; info: TransferInfo }> {
    const { id, bank_account_id, amount } = request;
    const { country_code, email, documents } = await this.userService.getUserInfo(id);
    const bank = await this.bankAccountEntityRepository.findOneBy({
      user_id: id,
      id: bank_account_id,
      country: country_code,
    });
    if (!bank) {
      throw new GrpcException(Status.INVALID_ARGUMENT, 'Bank doesnt exist!', 400);
    }
    await this.koyweTokenManager.getToken(email);

    const countries: CountryData = countriesData;
    const { currency_type } = countries[country_code];
    const quote = await this.createQuote(amount, currency_type);
    const document = documents?.find((d) => d.status === 'approved');
    if (!document) {
      throw new ConflictException('KYC is not completed');
    }
    const { orderId, providedAddress } = await this.createOrder(
      quote.quoteId,
      email,
      bank.account_uuid,
      document.document_number,
    );
    const totalFee = (quote.networkFee + quote.koyweFee) * quote.exchangeRate;
    await this.transferRepository.save(
      this.transferRepository.create({
        user_id: id,
        uuid: orderId,
        type: TransferTypes.WITHDRAWAL,
        provider: Providers.KOYWE,
        amount: quote.amountOut,
        amount_usd: amount,
        currency_type,
        status: TransferStatus.PENDING,
        fee: totalFee,
      }),
    );
    const info = {
      amount: quote.amountOut,
      currency: currency_type,
      rate: quote.exchangeRate,
      fee: totalFee,
    };

    return { wallet: providedAddress, info };
  }

  async createQuote(amountUsd: number, currency: string): Promise<KoyweQuote> {
    try {
      const paymentMethodId = await this.koyweMainManager.getPaymentMethodId(currency);

      const formData = {
        symbolIn: this.asset,
        symbolOut: currency,
        amountIn: amountUsd,
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
    bank_id: string,
    documentNumber: string,
  ): Promise<KoyweCreateOrder> {
    try {
      const token = await this.redis.get('koywe_token');
      const formData = {
        destinationAddress: bank_id,
        quoteId,
        email,
        metadata: 'Withdraw funds',
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
