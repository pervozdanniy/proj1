import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { lastValueFrom } from 'rxjs';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { DepositFundsDto } from '~svc/api-gateway/src/payment-gateway/dtos/deposit-funds.dto';
import { SettleFundsDto } from '~svc/api-gateway/src/payment-gateway/dtos/settle-funds.dto';
import { SettleWithdrawDto } from '~svc/api-gateway/src/payment-gateway/dtos/settle-withdraw.dto';
import { VerifyOwnerDto } from '~svc/api-gateway/src/payment-gateway/dtos/verify-owner.dto';
import { WebhookUrlDto } from '~svc/api-gateway/src/payment-gateway/dtos/webhook-url.dto';

@Injectable()
export class SandboxService {
  constructor(private readonly httpService: HttpService, @InjectRedis() private readonly redis: Redis) {}

  async settleWithdraw(payload: SettleWithdrawDto) {
    const token = await this.redis.get('prime_token');
    const { funds_transfer_id } = payload;
    try {
      const headersRequest = {
        Authorization: `Bearer ${token}`,
      };

      const withdrawResponse = await lastValueFrom(
        this.httpService.post(
          `https://sandbox.primetrust.com/v2/funds-transfers/${funds_transfer_id}/sandbox/settle`,
          null,
          {
            headers: headersRequest,
          },
        ),
      );

      return withdrawResponse.data;
    } catch (e) {
      throw new Error(e.response.data);
    }
  }

  async verifyOwner(payload: VerifyOwnerDto) {
    const token = await this.redis.get('prime_token');
    const { disbursement_authorizations_id } = payload;
    try {
      const headersRequest = {
        Authorization: `Bearer ${token}`,
      };

      const verifyResponse = await lastValueFrom(
        this.httpService.post(
          `https://sandbox.primetrust.com/v2/disbursement-authorizations/${disbursement_authorizations_id}/sandbox/verify-owner`,
          null,
          {
            headers: headersRequest,
          },
        ),
      );

      return verifyResponse.data;
    } catch (e) {
      throw new Error(e.response.data);
    }
  }

  async depositFunds(payload: DepositFundsDto) {
    const token = await this.redis.get('prime_token');
    const { transfer_reference_id, data } = payload;
    const formData = {
      data: {
        type: 'contributions',
        attributes: {
          amount: data.amount,
          'currency-type': data.currency_type,
          'funds-transfer-type': data.funds_transfer_type,
        },
      },
    };
    try {
      const headersRequest = {
        Authorization: `Bearer ${token}`,
      };

      const transferRefResponse = await lastValueFrom(
        this.httpService.post(
          `https://sandbox.primetrust.com/v2/contact-funds-transfer-references/${transfer_reference_id}/sandbox/contribution`,
          formData,
          {
            headers: headersRequest,
          },
        ),
      );

      return transferRefResponse.data;
    } catch (e) {
      throw new Error(e.response.data);
    }
  }

  async settleFunds(payload: SettleFundsDto) {
    const token = await this.redis.get('prime_token');
    const { contribution_id } = payload;

    try {
      const headersRequest = {
        Authorization: `Bearer ${token}`,
      };

      await lastValueFrom(
        this.httpService.post(
          `https://sandbox.primetrust.com/v2/contributions/${contribution_id}/sandbox/authorize`,
          null,
          {
            headers: headersRequest,
          },
        ),
      );

      const contributionResponse = await lastValueFrom(
        this.httpService.post(
          `https://sandbox.primetrust.com/v2/contributions/${contribution_id}/sandbox/settle`,
          null,
          {
            headers: headersRequest,
          },
        ),
      );

      return contributionResponse.data;
    } catch (e) {
      throw new Error(e.response.data);
    }
  }

  async bind(payload: WebhookUrlDto) {
    const token = await this.redis.get('prime_token');
    const formData = {
      data: {
        type: 'webhook-configs',
        attributes: {
          url: `${payload.url}/payment_gateway/account/webhook`,
          enabled: true,
        },
      },
    };

    const headersRequest = {
      Authorization: `Bearer ${token}`,
    };
    try {
      const webhooks = await lastValueFrom(
        this.httpService.get(`https://sandbox.primetrust.com/v2/webhook-configs`, {
          headers: headersRequest,
        }),
      );

      webhooks.data.data.map(async (w) => {
        await lastValueFrom(
          this.httpService.patch(`https://sandbox.primetrust.com/v2/webhook-configs/${w.id}`, formData, {
            headers: headersRequest,
          }),
        );
      });

      return { success: true };
    } catch (e) {
      throw new Error(e.response.data);
    }
  }
}
