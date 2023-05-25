import { KoyweOrderInfo, KoyweQuote } from '@/payment-gateway/types/koywe';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { lastValueFrom } from 'rxjs';
import { ConfigInterface } from '~common/config/configuration';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';

export type KoywePaymentMethod = 'KHIPU' | 'WIRECL' | 'PALOMMA' | 'WIREMX';

@Injectable()
export class KoyweMainManager {
  private readonly koywe_url: string;
  constructor(
    private readonly httpService: HttpService,
    @InjectRedis() private readonly redis: Redis,

    config: ConfigService<ConfigInterface>,
  ) {
    const { koywe_url } = config.get('app');
    this.koywe_url = koywe_url;
  }

  async getOrderInfo(orderId: string): Promise<KoyweOrderInfo> {
    try {
      const token = await this.redis.get('koywe_token');
      const headersRequest = {
        Authorization: `Bearer ${token}`,
      };

      const result = await lastValueFrom(
        this.httpService.get(`${this.koywe_url}/orders/${orderId}`, { headers: headersRequest }),
      );

      return result.data;
    } catch (e) {
      throw new GrpcException(Status.ABORTED, e.response.data.message, 400);
    }
  }

  async getPaymentMethodId(currency: string, paymentMethod: KoywePaymentMethod = 'WIRECL'): Promise<string> {
    const clientId = await this.redis.get('koywe_client_id');
    const paymentMethodResponse = await lastValueFrom(
      this.httpService.get(`${this.koywe_url}/payment-providers?symbol=${currency}&clientId=${clientId}`),
    );

    //temporary solution,must be changed
    let id: string = null;
    paymentMethodResponse.data.forEach((method: { _id: string; name: string }) => {
      if (method.name === paymentMethod) {
        id = method._id;
      }
    });

    return id;
  }

  async getQuoteFromUsd(amount: number, currency: string) {
    const result = await lastValueFrom(
      this.httpService.post<KoyweQuote>(`${this.koywe_url}/quotes`, {
        amountOut: amount,
        symbolOut: currency,
        symbolIn: 'USDC',
      }),
    );

    return result.data;
  }

  async getCurrencyAmountByUsd(amount: number, currency: string) {
    const result = await lastValueFrom(
      this.httpService.post<KoyweQuote>(`${this.koywe_url}/quotes`, {
        amountOut: amount,
        symbolIn: currency,
        symbolOut: 'USDC',
      }),
    );

    return result.data;
  }
}
