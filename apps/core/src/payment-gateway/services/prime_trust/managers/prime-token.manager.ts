import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { ConfigInterface } from '~common/config/configuration';

@Injectable()
export class PrimeTokenManager {
  private readonly prime_trust_url: string;
  private readonly email: string;
  private readonly password: string;
  constructor(private readonly httpService: HttpService, config: ConfigService<ConfigInterface>) {
    const { prime_trust_url } = config.get('app');
    const { email, password } = config.get('prime_trust');
    this.email = email;
    this.password = password;
    this.prime_trust_url = prime_trust_url;
  }

  async getToken() {
    const result = await lastValueFrom(
      this.httpService.post(
        `${this.prime_trust_url}/auth/jwts`,
        {},
        { auth: { username: this.email, password: this.password } },
      ),
    );

    return result.data;
  }
}
