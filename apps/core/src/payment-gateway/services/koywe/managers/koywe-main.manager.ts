import { KoyweOrderInfo } from '@/payment-gateway/types/koywe';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { lastValueFrom } from 'rxjs';
import { ConfigInterface } from '~common/config/configuration';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';

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
}
