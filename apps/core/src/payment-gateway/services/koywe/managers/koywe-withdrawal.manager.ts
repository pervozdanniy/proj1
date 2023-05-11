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
import { TransferMethodRequest } from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { TransfersEntity } from '~svc/core/src/payment-gateway/entities/transfers.entity';
import { countriesData, CountryData } from '../../../country/data';
import { VeriffDocumentEntity } from '../../../entities/veriff-document.entity';
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

    @InjectRepository(VeriffDocumentEntity)
    private readonly documentRepository: Repository<VeriffDocumentEntity>,
    @InjectRepository(TransfersEntity)
    private readonly withdrawalEntityRepository: Repository<TransfersEntity>,
    @InjectRedis() private readonly redis: Redis,

    config: ConfigService<ConfigInterface>,
  ) {
    const { koywe_url } = config.get('app');
    const { short } = config.get('asset');
    this.asset = short;
    this.koywe_url = koywe_url;
  }

  async makeWithdrawal(request: TransferMethodRequest): Promise<string> {
    const { id, bank_account_id, amount: beforeConvertAmount } = request;
    const { country_code, email } = await this.userService.getUserInfo(id);
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

    const convertData = await lastValueFrom(
      this.httpService.get(`https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=${this.asset}`),
    );
    const convertedAmount = parseFloat(beforeConvertAmount) * parseFloat(convertData.data[`${this.asset}`]);

    const amount = String(convertedAmount.toFixed(2));
    const { quoteId } = await this.createQuote(amount, currency_type);
    const document = await this.documentRepository.findOneBy({ user_id: id, status: 'approved' });
    if (!document) {
      throw new ConflictException('KYC is not completed');
    }
    const { orderId, providedAddress } = await this.createOrder(
      quoteId,
      email,
      bank.account_uuid,
      document.document_number,
    );
    const { status, koyweFee, networkFee } = await this.koyweMainManager.getOrderInfo(orderId);
    const fee = String(networkFee + koyweFee);
    await this.withdrawalEntityRepository.save(
      this.withdrawalEntityRepository.create({
        user_id: id,
        uuid: orderId,
        type: 'withdrawal',
        provider: Providers.KOYWE,
        amount,
        currency_type: 'USD',
        status: status.toLowerCase(),
        fee,
      }),
    );

    return providedAddress;
  }

  async createQuote(amount: string, currency_type: string): Promise<KoyweQuote> {
    try {
      const paymentMethodId = await this.koyweMainManager.getPaymentMethodId(currency_type);

      const formData = {
        symbolIn: this.asset,
        symbolOut: currency_type,
        amountIn: amount,
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
