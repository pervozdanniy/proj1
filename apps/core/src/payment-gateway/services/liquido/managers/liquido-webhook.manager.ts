import { Status } from '@grpc/grpc-js/build/src/constants';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import uid from 'uid-safe';
import { ConfigInterface } from '~common/config/configuration';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import { LiquidoWebhookRequest } from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { UserService } from '../../../../user/services/user.service';
import { LiquidoTokenManager } from './liquido-token.manager';

@Injectable()
export class LiquidoWebhookManager {
  private readonly logger = new Logger(LiquidoWebhookManager.name);
  private readonly api_url: string;
  private readonly x_api_key: string;

  private readonly domain: string;
  constructor(
    config: ConfigService<ConfigInterface>,
    private readonly liquidoTokenManager: LiquidoTokenManager,
    private userService: UserService,
    private readonly httpService: HttpService,
  ) {
    const { domain } = config.get('app', { infer: true });
    const { api_url, x_api_key } = config.get('liquido', { infer: true });
    this.api_url = api_url;
    this.x_api_key = x_api_key;
    this.domain = domain;
  }

  async liquidoWebhooksHandler({
    amount,
    currency,
    country,
    paymentStatus,
    email,
  }: LiquidoWebhookRequest): Promise<SuccessResponse> {
    const { token } = await this.liquidoTokenManager.getToken();
    const user = await this.userService.findByLogin({ email });
    const userDetails = await this.userService.getUserInfo(user.id);

    try {
      if (paymentStatus === 'SETTLED') {
        const headersRequest = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-api-key': this.x_api_key,
        };

        const formData = {
          idempotencyKey: await uid(18),
          country,
          targetName: userDetails.details.first_name,
          targetBankAccountId: '706180005047305123',
          amountInCents: amount,
          currency: currency,
          comment: 'Liquido CompanyName',
          callbackUrl: `${this.domain}/webhook/liquido`,
        };

        const result = await lastValueFrom(
          this.httpService.post(`${this.api_url}/v1/payments/payouts/spei`, formData, { headers: headersRequest }),
        );

        this.logger.log(result.data);
      }

      return { success: true };
    } catch (e) {
      this.logger.error(e.response.data);

      throw new GrpcException(Status.ABORTED, 'Liquido payment exception!', 400);
    }
  }
}
