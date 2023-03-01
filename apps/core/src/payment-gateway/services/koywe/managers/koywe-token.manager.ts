import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { lastValueFrom } from 'rxjs';
import { ConfigInterface } from '~common/config/configuration';

@Injectable()
export class KoyweTokenManager {
  private readonly koywe_url: string;
  private readonly client_id: string;
  private readonly secret: string;
  constructor(
    private readonly httpService: HttpService,
    config: ConfigService<ConfigInterface>,
    @InjectRedis() private readonly redis: Redis,
  ) {
    const { koywe_url } = config.get('app');
    const { client_id, secret } = config.get('koywe');
    this.koywe_url = koywe_url;
    this.client_id = client_id;
    this.secret = secret;
  }

  async getToken(email: string): Promise<{ token: string }> {
    const data = {
      clientId: this.client_id,
      email,
      secret: this.secret,
    };
    const result = await lastValueFrom(this.httpService.post(`${this.koywe_url}/auth`, data));
    if (result.data) {
      this.redis.set('koywe_token', result.data.token);
    }

    return { token: result.data.token };
  }
}
