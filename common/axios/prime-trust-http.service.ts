import { Status } from '@grpc/grpc-js/build/src/constants';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import Redis from 'ioredis';
import { lastValueFrom } from 'rxjs';
import { ConfigInterface } from '~common/config/configuration';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';

export class PrimeTrustHttpService extends HttpService {
  private readonly prime_trust_url: string;
  private readonly password: string;
  private readonly email: string;
  private errorsCount = 0;
  constructor(@InjectRedis() private readonly redis: Redis, private config: ConfigService<ConfigInterface>) {
    super();
    const { prime_trust_url } = config.get('app');
    const { email, password } = config.get('prime_trust');
    this.prime_trust_url = prime_trust_url;
    this.email = email;
    this.password = password;
  }

  async axios<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await this._request(config);
    } catch (e) {
      this.errorsCount++;
      const error = e.response.data.errors.shift();
      if (error.status === 401 && this.errorsCount < 5) {
        const token = await this.authorize();
        await this.redis.set('prime_token', token);

        return await this.axios(config);
      } else {
        throw new GrpcException(Status.ABORTED, error.detail, error.status);
      }
    }
  }

  async _request(config) {
    const token = await this.getToken();
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

    return await lastValueFrom(this.request(config));
  }

  async getToken() {
    const token = await this.redis.get('prime_token');
    if (!token) {
      this.authorize().then((token: string) => {
        this.redis.set('prime_token', token);
      });
    }

    return token;
  }

  async authorize() {
    const headersRequest = {
      Authorization: `Basic ${Buffer.from(`${this.email}:${this.password}`).toString('base64')}`,
    };

    const result = await lastValueFrom(this.post(`${this.prime_trust_url}/auth/jwts`, {}, { headers: headersRequest }));

    return result.data.token;
  }
}
