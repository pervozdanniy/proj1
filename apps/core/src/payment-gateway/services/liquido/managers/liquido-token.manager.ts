import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { lastValueFrom } from 'rxjs';
import { ConfigInterface } from '~common/config/configuration';

@Injectable()
export class LiquidoTokenManager {
  private readonly client_id: string;
  private readonly secret: string;
  private readonly auth_url: string;
  constructor(
    private readonly httpService: HttpService,
    config: ConfigService<ConfigInterface>,
    @InjectRedis() private readonly redis: Redis,
  ) {
    const { client_id, secret, auth_url } = config.get('liquido', { infer: true });
    this.client_id = client_id;
    this.secret = secret;
    this.auth_url = auth_url;
  }

  async getToken(): Promise<{ token: string }> {
    const data = {
      client_id: this.client_id,
      client_secret: this.secret,
      grant_type: 'client_credentials',
    };
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    const result = await lastValueFrom(this.httpService.post(`${this.auth_url}/oauth2/token`, data, { headers }));
    if (result.data) {
      this.redis.set('liquido_token', result.data.access_token);
    }

    return { token: result.data.access_token };
  }
}
