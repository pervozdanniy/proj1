import { BankAccountEntity } from '@/payment-gateway/entities/prime_trust/bank-account.entity';
import { Status } from '@grpc/grpc-js/build/src/constants';
// import { HttpService } from '@nestjs/axios';
import { UserService } from '@/user/services/user.service';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { TransferMethodRequest } from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { KoyweTokenManager } from './koywe-token.manager';

@Injectable()
export class KoyweWithdrawalManager {
  private readonly koywe_url: string;
  constructor(
    private readonly koyweTokenManager: KoyweTokenManager,
    private readonly httpService: HttpService,
    private userService: UserService,
    @InjectRepository(BankAccountEntity)
    private readonly bankAccountEntityRepository: Repository<BankAccountEntity>,
    @InjectRedis() private readonly redis: Redis,

    config: ConfigService<ConfigInterface>,
  ) {
    const { koywe_url } = config.get('app');
    this.koywe_url = koywe_url;
  }

  async makeWithdrawal(request: TransferMethodRequest): Promise<string> {
    const { id, bank_account_id, amount: beforeConvertAmount } = request;
    const userDetails = await this.userService.getUserInfo(id);
    const {
      country: { code: country },
      email,
    } = userDetails;
    const bank = await this.bankAccountEntityRepository.findOneBy({ user_id: id, id: bank_account_id, country });
    if (!bank) {
      throw new GrpcException(Status.INVALID_ARGUMENT, 'Bank doesnt exist!', 400);
    }
    await this.koyweTokenManager.getToken(email);

    const countryInfo = await lastValueFrom(
      this.httpService.get(`https://restcountries.com/v3.1/alpha/${userDetails.country.code}`),
    );
    const currencies = countryInfo.data[0].currencies;
    const currencyKeys = Object.keys(currencies);
    const currency_type = currencyKeys[0];

    const convertData = await lastValueFrom(
      this.httpService.get(`https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=USDC`),
    );
    const convertedAmount = parseFloat(beforeConvertAmount) * parseFloat(convertData.data['USDC']);

    const amount = String(convertedAmount.toFixed(2));
    const { quoteId } = await this.createQuote(amount, currency_type);
    const order = await this.createOrder(quoteId, userDetails.email, bank.account_uuid);

    return order.providedAddress;
  }

  async createQuote(amount: string, currency_type: string) {
    try {
      const formData = {
        symbolIn: 'USDC',
        symbolOut: currency_type,
        amountIn: amount,
        paymentMethodId: '632d7fe6237ded3a748112cf',
        executable: true,
      };

      const result = await lastValueFrom(this.httpService.post(`${this.koywe_url}/quotes`, formData));

      return result.data;
    } catch (e) {
      throw new GrpcException(Status.ABORTED, e.response.data.message, 400);
    }
  }

  async createOrder(quoteId: string, email: string, bank_id: string) {
    try {
      const token = await this.redis.get('koywe_token');
      const formData = {
        destinationAddress: bank_id,
        quoteId,
        email,
        metadata: 'Deposit funds',
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
