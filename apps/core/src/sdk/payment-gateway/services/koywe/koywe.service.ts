import { Status } from '@grpc/grpc-js/build/src/constants';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { lastValueFrom } from 'rxjs';
import { ConfigInterface } from '~common/config/configuration';
import { CreateReferenceRequest, PrimeTrustData } from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
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

  async createReference(userDetails: UserEntity, depositParams: CreateReferenceRequest): Promise<PrimeTrustData> {
    const { amount, currency_type } = depositParams;
    const token = await this.getToken(userDetails.email);
    const { quoteId } = await this.createQuote(amount, currency_type, token);
    const order = await this.createOrder(quoteId, userDetails.email, token);

    return { data: JSON.stringify(order) };
  }

  async createQuote(amount, currency_type, token) {
    try {
      const formData = {
        symbolIn: currency_type,
        symbolOut: 'USDC',
        amountIn: amount,
        paymentMethodId: '632d7fe6237ded3a748112cf',
        executable: true,
      };
      const headersRequest = {
        Authorization: `Bearer ${token}`,
      };

      const result = await lastValueFrom(
        this.httpService.post(`${this.koywe_url}/quotes`, formData, { headers: headersRequest }),
      );

      return result.data;
    } catch (e) {
      throw new GrpcException(Status.ABORTED, e.response.data.message, 400);
    }
  }

  async createOrder(quoteId, email, token) {
    try {
      const formData = {
        destinationAddress: '0x9fB17767f61c36799C11D94785360f9E69aC7220',
        quoteId,
        email,
        documentNumber: '111111111',
        metadata: 'in esse',
      };
      const headersRequest = {
        Authorization: `Bearer ${token}`,
      };

      const result = await lastValueFrom(
        this.httpService.post(`${this.koywe_url}/orders`, formData, { headers: headersRequest }),
      );

      return result.data;
    } catch (e) {
      throw new GrpcException(Status.ABORTED, e.response.data.message, 400);
    }
  }
}
