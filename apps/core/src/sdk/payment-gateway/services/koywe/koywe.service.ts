import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { lastValueFrom } from 'rxjs';
import { ConfigInterface } from '~common/config/configuration';
import { PrimeTrustData } from '~common/grpc/interfaces/payment-gateway';
import { UserEntity } from '../../../../user/entities/user.entity';

@Injectable()
export class KoyweService {
  private readonly koywe_url: string;
  private readonly client_id: string;
  private readonly secret: string;
  constructor(
    private readonly httpService: HttpService,
    private config: ConfigService<ConfigInterface>,
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

    return { token: result.data.token };
  }

  async createReference(request: UserEntity): Promise<PrimeTrustData> {
    const token = await this.getToken(request.email);

    return { data: JSON.stringify(token) };
  }
}
