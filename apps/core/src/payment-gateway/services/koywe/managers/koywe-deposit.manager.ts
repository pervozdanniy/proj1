import { ReferenceData } from '@/payment-gateway/types/koywe';
import { UserService } from '@/user/services/user.service';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import process from 'process';
import { lastValueFrom } from 'rxjs';
import { ConfigInterface } from '~common/config/configuration';
import { CreateReferenceRequest, JsonData } from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { KoyweTokenManager } from './koywe-token.manager';

@Injectable()
export class KoyweDepositManager {
  private readonly koywe_url: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly koyweTokenManager: KoyweTokenManager,

    private userService: UserService,
    config: ConfigService<ConfigInterface>,
    @InjectRedis() private readonly redis: Redis,
  ) {
    const { koywe_url } = config.get('app');
    this.koywe_url = koywe_url;
  }

  async createReference(
    depositParams: CreateReferenceRequest,
    wallet_address: string,
    asset_transfer_method_id: string,
  ): Promise<JsonData> {
    const { amount: beforeConvertAmount, id } = depositParams;
    const userDetails = await this.userService.getUserInfo(id);
    await this.koyweTokenManager.getToken(userDetails.email);
    const countryInfo = await lastValueFrom(
      this.httpService.get(`https://restcountries.com/v3.1/alpha/${userDetails.country.code}`),
    );
    const currencies = countryInfo.data[0].currencies;
    const currencyKeys = Object.keys(currencies);
    const currency_type = currencyKeys[0];

    const convertData = await lastValueFrom(
      this.httpService.get(`https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=${currency_type}`),
    );
    const convertedAmount = parseFloat(beforeConvertAmount) * parseFloat(convertData.data[currency_type]);

    const amount = String(convertedAmount.toFixed(2));

    const { quoteId } = await this.createQuote(amount, currency_type);
    const order = await this.createOrder(quoteId, userDetails.email, wallet_address);
    const parts = order.providedAddress.split('\n');

    const data: ReferenceData = {
      name: parts[0],
      account_number: parts[1],
      tax_id: parts[2],
      bank: parts[3],
      email: parts[4],
      amount,
      currency_type,
    };

    if (process.env.NODE_ENV === 'dev') {
      data.asset_transfer_method_id = asset_transfer_method_id;
      data.wallet_address = wallet_address;
    }

    return { data: JSON.stringify([data]) };
  }

  async createQuote(amount: string, currency_type: string) {
    try {
      const formData = {
        symbolIn: currency_type,
        symbolOut: 'USDC',
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

  async createOrder(quoteId: string, email: string, wallet_address: string) {
    try {
      const token = await this.redis.get('koywe_token');
      const formData = {
        destinationAddress: wallet_address,
        quoteId,
        email,
        metadata: 'in esse',
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
