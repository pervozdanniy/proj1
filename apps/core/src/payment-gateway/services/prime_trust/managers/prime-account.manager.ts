import { Status } from '@grpc/grpc-js/build/src/constants';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as process from 'process';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { NotificationService } from '~svc/core/src/notification/services/notification.service';
import { accountData } from '~svc/core/src/payment-gateway/constants/account.data';
import { PrimeTrustAccountEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-account.entity';
import { PrimeKycManager } from '~svc/core/src/payment-gateway/services/prime_trust/managers/prime-kyc-manager';
import { PrimeTokenManager } from '~svc/core/src/payment-gateway/services/prime_trust/managers/prime-token.manager';
import { UserEntity } from '~svc/core/src/user/entities/user.entity';

@Injectable()
export class PrimeAccountManager {
  private readonly logger = new Logger(PrimeAccountManager.name);
  private readonly prime_trust_url: string;
  private readonly app_domain: string;
  constructor(
    private config: ConfigService<ConfigInterface>,
    private readonly httpService: HttpService,

    private readonly notificationService: NotificationService,

    private readonly primeKycManager: PrimeKycManager,

    private readonly primeTokenManager: PrimeTokenManager,

    @InjectRepository(PrimeTrustAccountEntity)
    private readonly primeAccountRepository: Repository<PrimeTrustAccountEntity>,
  ) {
    const { prime_trust_url, domain } = config.get('app');
    this.prime_trust_url = prime_trust_url;
    this.app_domain = domain;
  }

  async createAccount(userDetails, token) {
    const item = await this.primeAccountRepository.find();

    if (item.length !== 0) {
      throw new GrpcException(Status.ALREADY_EXISTS, 'Account already exist', 400);
    }

    const headersRequest = {
      Authorization: `Bearer ${token}`,
    };

    const accountResponse = await lastValueFrom(
      this.httpService.get(`${this.prime_trust_url}/v2/accounts`, { headers: headersRequest }),
    );
    let account;

    if (accountResponse.data.data.length !== 0) {
      account = accountResponse.data.data[0];
      await this.saveAccount(account);
    } else {
      await this.createAccountInPrimeTrust(token);
    }

    await this.hangWebhook(userDetails, token, account.id);

    return { success: true };
  }

  async createAccountInPrimeTrust(token) {
    const headersRequest = {
      Authorization: `Bearer ${token}`,
    };

    try {
      const accountResponse = await lastValueFrom(
        this.httpService.post(`${this.prime_trust_url}/v2/accounts`, accountData, { headers: headersRequest }),
      );

      // account open from development
      if (process.env.NODE_ENV === 'dev') {
        await lastValueFrom(
          this.httpService.post(
            `${this.prime_trust_url}/v2/accounts/${accountResponse.data.data.id}/sandbox/open`,
            null,
            { headers: headersRequest },
          ),
        );
      }
      //

      await this.saveAccount(accountResponse.data.data);

      // const contactResponse = await lastValueFrom(
      //   this.httpService.get(`${this.prime_trust_url}/v2/contacts`, { headers: headersRequest }),
      // );
      // const contactData = { data: contactResponse.data.data[0] };
      //
      // return await this.primeKycManager.saveContact(contactData, account.id);
      //
    } catch (e) {
      this.logger.error(e.response.data.errors);

      throw new GrpcException(Status.ABORTED, e.response.data, 400);
    }
  }

  async hangWebhook(userDetails, token, account_id) {
    const headersRequest = {
      Authorization: `Bearer ${token}`,
    };

    const webhookChange = {
      data: {
        type: 'webhook-configs',
        attributes: {
          url: `${this.app_domain}/payment_gateway/account/webhook`,
          enabled: true,
        },
      },
    };

    const webhookConfig = await lastValueFrom(
      this.httpService.get(`${this.prime_trust_url}/v2/webhook-configs`, { headers: headersRequest }),
    );

    if (webhookConfig.data.data.length !== 0) {
      if (webhookConfig.data.data[0].attributes.url !== `${this.app_domain}/payment_gateway/account/webhook`) {
        await lastValueFrom(
          this.httpService.patch(
            `${this.prime_trust_url}/v2/webhook-configs/${webhookConfig.data.data[0].id}`,
            webhookChange,
            {
              headers: headersRequest,
            },
          ),
        );
      }
    } else {
      // hang webhook on account
      await lastValueFrom(
        this.httpService.post(
          `${this.prime_trust_url}/v2/webhook-configs`,
          {
            data: {
              type: 'webhook-configs',
              attributes: {
                'contact-email': userDetails.email,
                url: `${this.app_domain}/payment_gateway/account/webhook`,
                'account-id': account_id,
              },
            },
          },
          {
            headers: headersRequest,
          },
        ),
      );
    }
  }

  async saveAccount(accountData): Promise<PrimeTrustAccountEntity> {
    try {
      const accountPayload = {
        uuid: accountData.id,
        name: accountData.attributes.name,
        number: accountData.attributes.number,
        contributions_frozen: accountData.attributes['contributions-frozen'],
        disbursements_frozen: accountData.attributes['disbursements-frozen'],
        statements: accountData.attributes['contributions-frozen'],
        solid_freeze: accountData.attributes['solid-freeze'],
        offline_cold_storage: accountData.attributes['offline-cold-storage'],
        status: accountData.attributes.status,
      };
      const account = await this.primeAccountRepository.save(this.primeAccountRepository.create(accountPayload));

      return account;
    } catch (e) {
      throw new GrpcException(Status.ABORTED, e.message, 400);
    }
  }

  async updateAccount(id: string): Promise<SuccessResponse> {
    const accountData = await this.primeAccountRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect(UserEntity, 'p', 'a.user_id = p.user_id')
      .leftJoinAndSelect('p.skopa_user', 'u')
      .select(['a.uuid as account_id,u.email as email,p.password as password,u.id as user_id,u.username as username'])
      .where('a.uuid = :id', { id })
      .getRawMany();

    if (accountData.length == 0) {
      throw new GrpcException(Status.NOT_FOUND, `Account by ${id} id not found`, 400);
    }
    const { account_id, user_id } = accountData[0];

    const userDetails = {
      email: accountData[0].email,
      prime_user: { password: accountData[0].password },
    };

    const accountResponse = await this.getAccountInfo(userDetails, account_id);
    await this.primeAccountRepository.update(
      { uuid: account_id },
      {
        status: accountResponse.status,
      },
    );

    const notificationPayload = {
      user_id,
      title: 'User Account',
      type: 'accounts',
      description: `Account created with status ${accountResponse.status}`,
    };

    this.notificationService.createAsync(notificationPayload);

    return { success: true };
  }

  async getAccountInfo(userDetails, account_id) {
    const { token } = await this.primeTokenManager.getToken();
    const headersRequest = {
      Authorization: `Bearer ${token}`,
    };

    try {
      const accountResponse = await lastValueFrom(
        this.httpService.get(`${this.prime_trust_url}/v2/accounts/${account_id}`, {
          headers: headersRequest,
        }),
      );

      return accountResponse.data.data.attributes;
    } catch (e) {
      this.logger.error(e.response.data);

      throw new GrpcException(Status.ABORTED, e.response.data, 400);
    }
  }
}
