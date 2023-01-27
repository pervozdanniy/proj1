import { Status } from '@grpc/grpc-js/build/src/constants';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as process from 'process';
import { Repository } from 'typeorm';
import { PrimeTrustHttpService } from '~common/axios/prime-trust-http.service';
import { ConfigInterface } from '~common/config/configuration';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { NotificationService } from '~svc/core/src/notification/services/notification.service';
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
    private readonly httpService: PrimeTrustHttpService,

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

  async createAccount(userDetails: UserEntity) {
    const account = await this.primeAccountRepository.findOne({ where: { user_id: userDetails.id } });
    if (account) {
      throw new GrpcException(Status.ALREADY_EXISTS, 'Account already exist', 400);
    }

    const formData = {
      data: {
        type: 'account',
        attributes: {
          'account-type': 'custodial',
          name: `${userDetails.details.first_name} ${userDetails.details.last_name}s Account`,
          'authorized-signature': `Signature ${userDetails.email}`,
          owner: {
            'contact-type': 'natural_person',
            name: `${userDetails.details.first_name} ${userDetails.details.last_name}`,
            email: `${userDetails.email}`,
            'tax-id-number': `${userDetails.details.tax_id_number}`,
            'tax-country': `${userDetails.country.code}`,
            'date-of-birth': `${userDetails.details.date_of_birth}`,
            'primary-phone-number': {
              country: `${userDetails.country.code}`,
              number: `${userDetails.phone}`,
              sms: true,
            },
            'primary-address': {
              'street-1': `${userDetails.details.street}`,
              'postal-code': `${userDetails.details.postal_code}`,
              city: `${userDetails.details.city}`,
              region: `${userDetails.details.region}`,
              country: `${userDetails.country.code}`,
            },
          },
        },
      },
    };

    try {
      const accountResponse = await this.httpService.axios({
        method: 'post',
        url: `${this.prime_trust_url}/v2/accounts`,
        data: formData,
      });

      //hang webhook on account
      await this.hangWebhook(userDetails, accountResponse.data.data.id);
      //

      // account open from development
      if (process.env.NODE_ENV === 'dev') {
        await this.httpService.axios({
          method: 'post',
          url: `${this.prime_trust_url}/v2/accounts/${accountResponse.data.data.id}/sandbox/open`,
          data: null,
        });
      }
      //

      //create contact after creating account
      const account = await this.saveAccount(accountResponse.data.data, userDetails.id);

      const contactResponse = await this.httpService.axios({
        method: 'get',
        url: `${this.prime_trust_url}/v2/contacts`,
      });
      const contactData = contactResponse.data.data.filter((contact) => {
        return contact.attributes['account-id'] === account.uuid;
      });

      return await this.primeKycManager.saveContact({ data: contactData.pop() }, account.user_id);
      //
    } catch (e) {
      this.logger.error(e.response.data.errors);

      throw new GrpcException(Status.ABORTED, e.response.data, 400);
    }
  }

  async hangWebhook(userDetails: UserEntity, account_id: string) {
    // hang webhook on account
    await this.httpService.axios({
      method: 'post',
      url: `${this.prime_trust_url}/v2/webhook-configs`,
      data: {
        data: {
          type: 'webhook-configs',
          attributes: {
            'contact-email': userDetails.email,
            url: `${this.app_domain}/payment_gateway/account/webhook`,
            'account-id': account_id,
          },
        },
      },
    });
  }

  async saveAccount(accountData, user_id: number): Promise<PrimeTrustAccountEntity> {
    try {
      const accountPayload = {
        user_id,
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
      .leftJoinAndSelect(UserEntity, 'u', 'a.user_id = u.id')
      .select(['a.uuid as account_id,u.id as user_id,u.username as username'])
      .where('a.uuid = :id', { id })
      .getRawOne();

    if (!accountData) {
      throw new GrpcException(Status.NOT_FOUND, `Account by ${id} id not found`, 400);
    }
    const { account_id, user_id } = accountData;

    const accountResponse = await this.getAccountInfo(account_id);
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

  async getAccountInfo(account_id: string) {
    try {
      const accountResponse = await this.httpService.axios({
        method: 'get',
        url: `${this.prime_trust_url}/v2/accounts/${account_id}`,
      });

      return accountResponse.data.data.attributes;
    } catch (e) {
      this.logger.error(e.response.data.errors[0]);

      throw new GrpcException(Status.ABORTED, e.response.data.errors[0], 400);
    }
  }
}
