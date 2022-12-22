import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { ConfigInterface } from '~common/config/configuration';

@Injectable()
export class PrimeTokenManager {
  private readonly prime_trust_url: string;
  constructor(private readonly httpService: HttpService, private config: ConfigService<ConfigInterface>) {
    const { prime_trust_url } = config.get('app');
    this.prime_trust_url = prime_trust_url;
  }

  async getToken(userDetails) {
    const headersRequest = {
      Authorization: `Basic ${Buffer.from(`${userDetails.email}:${userDetails.prime_user.password}`).toString(
        'base64',
      )}`,
    };

    const result = await lastValueFrom(
      this.httpService.post(`${this.prime_trust_url}/auth/jwts`, {}, { headers: headersRequest }),
    );

    return result.data;
  }
}
