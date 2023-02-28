import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { lastValueFrom } from 'rxjs';
import { createDate } from '~common/helpers';
import { CardResourceDto } from '../dtos/deposit/card-resource.dto';
import { DepositFundsDto } from '../dtos/deposit/deposit-funds.dto';
import { SettleFundsDto } from '../dtos/deposit/settle-funds.dto';
import { VerifyOwnerDto } from '../dtos/deposit/verify-owner.dto';
import { AccountIdDto } from '../dtos/sandbox/account-id.dto';
import { AddAssetDto } from '../dtos/sandbox/add-asset.dto';
import { DocumentIdDto } from '../dtos/sandbox/document-id.dto';
import { WebhookUrlDto } from '../dtos/sandbox/webhook-url.dto';
import { SettleWithdrawDto } from '../dtos/withdrawal/settle-withdraw.dto';

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
      return e.response.data.errors;
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
      return e.response.data.errors;
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
      return e.response.data.errors;
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
      return e.response.data.errors;
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
        this.httpService.get<{ data: Array<{ id: string }> }>(`https://sandbox.primetrust.com/v2/webhook-configs`, {
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
      return e.response.data.errors;
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
      return e.response.data.errors;
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
        this.httpService.post(`https://sandbox.primetrust.com/v2/accounts/${account_id}/sandbox/open`, null, {
          headers: headersRequest,
        }),
      );

      return accountResponse.data;
    } catch (e) {
      return e.response.data.errors;
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
      return e.response.data.errors;
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
      return e.response.data.errors;
    }
  }

  async addAssets(payload: AddAssetDto) {
    const token = await this.redis.get('prime_token');
    const { account_id, asset_transfer_method_id, contact_id, unit_count } = payload;
    const formData = {
      data: {
        type: 'asset-contributions',
        attributes: {
          'unit-count': unit_count,
          'asset-id': 'ecca8bab-dcb2-419a-973e-aebc39ff4f03',
          'contact-id': contact_id,
          'account-id': account_id,
          'asset-transfer-method-id': asset_transfer_method_id,
          'acquisition-on': createDate(),
          'cost-basis': '4000',
          'currency-type': 'USD',
        },
      },
    };

    try {
      const headersRequest = {
        Authorization: `Bearer ${token}`,
      };

      const cardResponse = await lastValueFrom(
        this.httpService.post(
          `https://sandbox.primetrust.com/v2/asset-contributions?include=asset-transfer-method,asset-transfer`,
          formData,
          {
            headers: headersRequest,
          },
        ),
      );

      cardResponse.data.included.map(async (inc: { type: string; id: string; attributes: { status: string } }) => {
        if (inc.type === 'asset-transfers' && inc.attributes.status === 'pending') {
          await lastValueFrom(
            this.httpService.post(`https://sandbox.primetrust.com/v2/asset-transfers/${inc.id}/sandbox/settle`, null, {
              headers: headersRequest,
            }),
          );
        }
      });

      return cardResponse.data;
    } catch (e) {
      return e.response.data.errors;
    }
  }
}
