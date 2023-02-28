import { UserService } from '@/user/services/user.service';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import process from 'process';
import { lastValueFrom } from 'rxjs';
import { ConfigInterface } from '~common/config/configuration';
import { BanksInfoResponse, CreateReferenceRequest, JsonData } from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { ReferenceData } from '../../types/koywe';
import { Country } from './enum/country';

@Injectable()
export class KoyweService {
  private readonly koywe_url: string;
  private readonly client_id: string;
  private readonly secret: string;
  constructor(
    private readonly httpService: HttpService,
    private userService: UserService,
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

  async createReference(
    depositParams: CreateReferenceRequest,
    wallet_address: string,
    asset_transfer_method_id: string,
  ): Promise<JsonData> {
    const { amount, currency_type, id } = depositParams;
    const userDetails = await this.userService.getUserInfo(id);
    await this.getToken(userDetails.email);

    const { quoteId } = await this.createQuote(amount, currency_type);
    const order = await this.createOrder(quoteId, userDetails.email, wallet_address);
    const parts = order.providedAddress.split('\n');

    const data: ReferenceData = {
      name: parts[0],
      account_number: parts[1],
      tax_id: parts[2],
      bank: parts[3],
      email: parts[4],
    };

    if (process.env.NODE_ENV === 'dev') {
      data.asset_transfer_method_id = asset_transfer_method_id;
      data.wallet_address = wallet_address;
    }

    return { data: JSON.stringify([data]) };
  }

  async createQuote(amount: string, currency_type: string) {
    try {
      const formData = {
        symbolIn: currency_type,
        symbolOut: 'USDC',
        amountIn: amount,
        paymentMethodId: '632d7fe6237ded3a748112cf',
        executable: true,
      };

      const result = await lastValueFrom(this.httpService.post(`${this.koywe_url}/quotes`, formData));

      return result.data;
    } catch (e) {
      throw new GrpcException(Status.ABORTED, e.response.data.message, 400);
    }
  }

  async createOrder(quoteId: string, email: string, wallet_address: string) {
    try {
      const token = await this.redis.get('koywe_token');
      const formData = {
        destinationAddress: wallet_address,
        quoteId,
        email,
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

  async getBanksInfo(country: string, email: string): Promise<BanksInfoResponse> {
    const token = await this.getToken(email);
    const code = Country[country as keyof typeof Country];

    const headersRequest = {
      Authorization: `Bearer ${token}`,
    };

    const result = await lastValueFrom(
      this.httpService.get(`${this.koywe_url}/bank-info/${code}`, { headers: headersRequest }),
    );

    return {
      data: result.data,
    };
  }
}
