import { UserService } from '@/user/services/user.service';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import { LinkCustomerRequest, LinkSessionResponse, Token_Data } from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { NotificationService } from '../../../../notification/services/notification.service';
import { LinkEntity } from '../../../entities/link.entity';

@Injectable()
export class PrimeLinkManager {
  private readonly url: string;
  private readonly client_id: string;
  private readonly secret_key;

  constructor(
    private userService: UserService,
    private readonly httpService: HttpService,

    private readonly notificationService: NotificationService,
    @InjectRepository(LinkEntity)
    private readonly linkEntityRepository: Repository<LinkEntity>,

    config: ConfigService<ConfigInterface>,
  ) {
    const { link_url } = config.get('app', { infer: true });
    const { client_id, secret_key } = config.get('link', { infer: true });
    this.url = link_url;
    this.client_id = client_id;
    this.secret_key = secret_key;
  }

  async getToken(): Promise<Token_Data> {
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
      throw new GrpcException(Status.ABORTED, e.response.data.message, 400);
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

    await this.linkEntityRepository.save(
      this.linkEntityRepository.create({
        user_id: id,
        session_id: result.data.sessionKey,
        status: 'created',
      }),
    );

    return { sessionKey: result.data.sessionKey };
  }

  async saveCustomer({ customerId, sessionId }: LinkCustomerRequest): Promise<SuccessResponse> {
    const { token } = await this.getToken();
    const headersRequest = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const accountResult = await lastValueFrom(
      this.httpService.get(`${this.url}/public/v1/customers/${customerId}`, { headers: headersRequest }),
    );

    const link = await this.linkEntityRepository.findOneBy({ session_id: sessionId });

    await this.linkEntityRepository.update(
      { session_id: sessionId },
      { customer_id: customerId, status: accountResult.data.accountDetails.accountStatus.toLowerCase() },
    );

    await this.notificationService.sendWs(link.user_id, 'link', 'Bank account linked!');

    return { success: true };
  }
}
