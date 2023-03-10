import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from '@nestjs/terminus/dist/health-indicator/http/axios.interfaces';
import { AxiosRequestConfig } from 'axios';
import Redis from 'ioredis';
import { lastValueFrom } from 'rxjs';
import { PrimeTokenManager } from '../services/prime_trust/managers/prime-token.manager';
import { PrimeTrustException } from './exception/prime-trust.exception';

export class PrimeTrustHttpService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly httpService: HttpService,
    private readonly primeTokenManager: PrimeTokenManager,
  ) {}

  async ensureAuth(force = false) {
    let prime_token: string;
    if (!force) {
      prime_token = await this.redis.get('prime_token');
      if (!prime_token) {
        const { token } = await this.primeTokenManager.getToken();
        await this.redis.set('prime_token', token);
      }
    } else {
      const { token } = await this.primeTokenManager.getToken();
      await this.redis.set('prime_token', token);
    }
    prime_token = await this.redis.get('prime_token');

    return prime_token;
  }

  async request<T = any>(config: AxiosRequestConfig, attempts = 5) {
    const token = await this.ensureAuth();

    config = this.createConfig(config, token);
    const _retry = async (attempts: number): Promise<AxiosResponse<T>> => {
      try {
        return await lastValueFrom(this.httpService.request(config));
      } catch (error) {
        if (attempts > 0 && error.response.data.errors[0].status === 401) {
          const token = await this.ensureAuth(true);
          config = this.createConfig(config, token);

          return _retry(attempts - 1);
        }

        if (error.response) {
          throw new PrimeTrustException(error.response);
        }

        throw error;
      }
    };

    return _retry(attempts);
  }

  createConfig(config: AxiosRequestConfig, token: string) {
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
          ...config.headers,
          Authorization: `Bearer ${token}`,
        },
      };
    }

    return config;
  }
}
