import { UserService } from '@/user/services/user.service';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import uid from 'uid-safe';
import { ConfigInterface } from '~common/config/configuration';
import { LinkSessionResponse, LinkTransferData } from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';

@Injectable()
export class PrimeLinkManager {
  private readonly url: string;
  private readonly client_id: string;
  private readonly secret_key: string;

  private readonly merchant_id: string;

  constructor(
    private userService: UserService,
    private readonly httpService: HttpService,

    config: ConfigService<ConfigInterface>,
  ) {
    const { link_url } = config.get('app', { infer: true });
    const { client_id, secret_key, merchant_id } = config.get('link', { infer: true });
    this.url = link_url;
    this.client_id = client_id;
    this.secret_key = secret_key;
    this.merchant_id = merchant_id;
  }

  async getToken() {
    try {
      const headersRequest = {
        'Content-Type': 'application/x-www-form-urlencoded',
      };

      const formData = {
        client_id: this.client_id,
        client_secret: this.secret_key,
        scope: 'Link-Core',
        grant_type: 'client_credentials',
      };

      const tokenResponse = await lastValueFrom(
        this.httpService.post(`${this.url}/v1/tokens`, formData, {
          headers: headersRequest,
        }),
      );

      return { token: tokenResponse.data.access_token };
    } catch (e) {
      throw new GrpcException(Status.INTERNAL, e.response?.data.message ?? e.message, 400);
    }
  }

  async linkSession(id: number): Promise<LinkSessionResponse> {
    const { token } = await this.getToken();
    const user = await this.userService.getUserInfo(id);
    const formData = {
      firstName: user.details.first_name,
      lastName: user.details.last_name,
      email: user.email,
      product: 'PAY',
    };

    const headersRequest = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const result = await lastValueFrom(
      this.httpService.post(`${this.url}/v1/sessions`, formData, { headers: headersRequest }),
    );

    return { sessionKey: result.data.sessionKey };
  }

  async sendAmount(customerId: string, amount: number, currency: string): Promise<LinkTransferData> {
    const { token } = await this.getToken();
    const headersRequest = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const id = await uid(18);

    const formData = {
      source: {
        id: customerId,
        type: 'CUSTOMER',
      },
      destination: {
        id: this.merchant_id,
        type: 'MERCHANT',
      },
      amount: {
        currency: currency,
        value: amount,
      },
      requestKey: id,
    };

    try {
      const paymentResponse = await lastValueFrom(
        this.httpService.post(`${this.url}/v1/payments`, formData, { headers: headersRequest }),
      );

      return { paymentId: paymentResponse.data.paymentId, paymentStatus: paymentResponse.data.paymentStatus };
    } catch (e) {
      throw new GrpcException(Status.INVALID_ARGUMENT, 'Payment error!', 400);
    }
  }
}
