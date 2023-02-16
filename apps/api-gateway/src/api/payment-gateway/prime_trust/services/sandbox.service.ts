import { AccountIdDto } from '@/api/payment-gateway/prime_trust/dtos/account-id.dto';
import { CardResourceDto } from '@/api/payment-gateway/prime_trust/dtos/card-resource.dto';
import { DepositFundsDto } from '@/api/payment-gateway/prime_trust/dtos/deposit-funds.dto';
import { DocumentIdDto } from '@/api/payment-gateway/prime_trust/dtos/document-id.dto';
import { SettleFundsDto } from '@/api/payment-gateway/prime_trust/dtos/settle-funds.dto';
import { SettleWithdrawDto } from '@/api/payment-gateway/prime_trust/dtos/settle-withdraw.dto';
import { VerifyOwnerDto } from '@/api/payment-gateway/prime_trust/dtos/verify-owner.dto';
import { WebhookUrlDto } from '@/api/payment-gateway/prime_trust/dtos/webhook-url.dto';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { lastValueFrom } from 'rxjs';

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
          url: `${payload.url}/prime_trust/account/webhook`,
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

  async getCardDescriptor(payload: CardResourceDto) {
    const token = await this.redis.get('prime_token');
    const { resource_id } = payload;

    try {
      const headersRequest = {
        Authorization: `Bearer ${token}`,
      };

      const cardResponse = await lastValueFrom(
        this.httpService.get(`https://sandbox.primetrust.com/v2/credit-card-resources/${resource_id}/sandbox`, {
          headers: headersRequest,
        }),
      );

      return cardResponse.data;
    } catch (e) {
      throw new Error(e.response.data);
    }
  }

  async openAccount(payload: AccountIdDto) {
    const token = await this.redis.get('prime_token');
    const { account_id } = payload;
    try {
      const headersRequest = {
        Authorization: `Bearer ${token}`,
      };

      const accountResponse = await lastValueFrom(
        this.httpService.get(`https://sandbox.primetrust.com/v2/accounts/${account_id}/sandbox/open`, {
          headers: headersRequest,
        }),
      );

      return accountResponse.data;
    } catch (e) {
      throw new Error(e.response.data);
    }
  }

  async verifyDocument(payload: DocumentIdDto) {
    const token = await this.redis.get('prime_token');
    const { document_id } = payload;

    try {
      const headersRequest = {
        Authorization: `Bearer ${token}`,
      };
      const cardResponse = await lastValueFrom(
        this.httpService.post(
          `https://sandbox.primetrust.com/v2/kyc-document-checks/${document_id}/sandbox/verify`,
          null,
          {
            headers: headersRequest,
          },
        ),
      );

      return cardResponse.data;
    } catch (e) {
      throw new Error(e.response.data);
    }
  }

  async failDocument(payload: DocumentIdDto) {
    const token = await this.redis.get('prime_token');
    const { document_id } = payload;
    const formData = {
      data: {
        type: 'kyc-document-checks',
        attributes: {
          'failure-details': 'some failure details',
        },
      },
    };

    try {
      const headersRequest = {
        Authorization: `Bearer ${token}`,
      };

      const cardResponse = await lastValueFrom(
        this.httpService.post(
          `https://sandbox.primetrust.com/v2/kyc-document-checks/${document_id}/sandbox/fail`,
          formData,
          {
            headers: headersRequest,
          },
        ),
      );

      return cardResponse.data;
    } catch (e) {
      throw new Error(e.response.data);
    }
  }
}
