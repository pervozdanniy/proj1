import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';
import Redis from 'ioredis';
import { lastValueFrom } from 'rxjs';
import { ConfigInterface } from '~common/config/configuration';
import { PrimeTokenManager } from '~svc/core/src/payment-gateway/services/prime_trust/managers/prime-token.manager';

export class PrimeTrustHttpService {
  private readonly prime_trust_url: string;
  private readonly password: string;
  private readonly email: string;

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private config: ConfigService<ConfigInterface>,
    private readonly httpService: HttpService,
    private readonly primeTokenManager: PrimeTokenManager,
  ) {
    const { prime_trust_url } = config.get('app');
    const { email, password } = config.get('prime_trust');
    this.prime_trust_url = prime_trust_url;
    this.email = email;
    this.password = password;
  }

  async ensureAuth(force = false) {
    let token;
    if (!force) {
      token = await this.redis.get('prime_token');
    }
    if (!token) {
      token = await this.primeTokenManager.getToken();
      await this.redis.set('prime_token', token);
    }

    return token;
  }

  async axios(config: AxiosRequestConfig, attempts = 5) {
    const token = await this.ensureAuth();

    config = this.createConfig(config, token);
    const _retry = async (attempts: number) => {
      try {
        return await lastValueFrom(this.httpService.request(config));
      } catch (error) {
        if (attempts > 0 && error.status === 401) {
          const token = await this.ensureAuth(true);
          config = this.createConfig(config, token);

          return _retry(attempts - 1);
        }

        throw error;
      }
    };

    return _retry(attempts);
  }

  createConfig(config, token) {
    if (!config.headers) {
      config = {
        ...config,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    } else {
      config = {
        ...config,
        headers: {
          Authorization: `Bearer ${token}`,
          ...config.headers,
        },
      };
    }

    return config;
  }
}
