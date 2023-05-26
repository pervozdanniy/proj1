import { CountryService } from '@/country/country.service';
import { NotificationService } from '@/notification/services/notification.service';
import { PrimeTrustAccountEntity } from '@/payment-gateway/entities/prime_trust/prime-trust-account.entity';
import { PrimeTrustException } from '@/payment-gateway/request/exception/prime-trust.exception';
import { PrimeTrustHttpService } from '@/payment-gateway/request/prime-trust-http.service';
import { AccountType, CreateAccountType } from '@/payment-gateway/types/prime-trust';
import { UserEntity } from '@/user/entities/user.entity';
import { UserService } from '@/user/services/user.service';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as process from 'process';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { IdRequest, SuccessResponse, UserAgreement } from '~common/grpc/interfaces/common';
import { AccountResponse, AccountStatusResponse, AgreementRequest } from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { PrimeTrustBalanceEntity } from '../../../entities/prime_trust/prime-trust-balance.entity';
import { PrimeKycManager } from './prime-kyc-manager';

@Injectable()
export class PrimeAccountManager {
  private readonly logger = new Logger(PrimeAccountManager.name);
  private readonly prime_trust_url: string;
  private readonly app_domain: string;

  constructor(
    config: ConfigService<ConfigInterface>,
    private readonly httpService: PrimeTrustHttpService,

    private readonly notificationService: NotificationService,

    private readonly primeKycManager: PrimeKycManager,

    private countryService: CountryService,

    private userService: UserService,

    @InjectRepository(PrimeTrustAccountEntity)
    private readonly primeAccountRepository: Repository<PrimeTrustAccountEntity>,
  ) {
    const { prime_trust_url, domain } = config.get('app');
    this.prime_trust_url = prime_trust_url;
    this.app_domain = domain;
  }

  async createAccountIfNotCreated(userDetails: UserEntity): Promise<AccountResponse> {
    const existing = await this.primeAccountRepository.findOne({ where: { user_id: userDetails.id } });
    if (existing) {
      return { uuid: existing.uuid, status: existing.status, name: existing.name, number: existing.number };
    }

    const formData: CreateAccountType = {
      data: {
        type: 'account',
        attributes: {
          'account-type': 'custodial',
          name: `${userDetails.details.first_name} ${userDetails.details.last_name}s Account`,
          'authorized-signature': `Signature`,
          'webhook-config': {
            url: `${this.app_domain}/webhook/prime_trust`,
          },
          owner: {
            'contact-type': 'natural_person',
            name: `${userDetails.details.first_name} ${userDetails.details.last_name}`,
            email: `${userDetails.email}`,
            'tax-id-number': `${userDetails.details.tax_id_number}`,
            'tax-country': `${userDetails.country_code}`,
            'date-of-birth': `${userDetails.details.date_of_birth}`,
            'primary-phone-number': {
              country: `${userDetails.country_code}`,
              number: `${userDetails.phone}`,
              sms: true,
            },
            'primary-address': {
              'street-1': `${userDetails.details.street}`,
              'postal-code': `${userDetails.details.postal_code}`,
              city: `${userDetails.details.city}`,
              country: `${userDetails.country_code}`,
            },
          },
        },
      },
    };
    if (userDetails.country_code === 'US') {
      formData.data.attributes.owner['primary-address']['region'] = `${userDetails.details.region}`;
    }
    let account: PrimeTrustAccountEntity;
    try {
      const accountResponse = await this.httpService.request({
        method: 'post',
        url: `${this.prime_trust_url}/v2/accounts`,
        data: formData,
      });
      account = await this.saveAccount(accountResponse.data.data, userDetails.id);
    } catch (e) {
      if (e instanceof PrimeTrustException) {
        const { detail, code } = e.getFirstError();
        this.notificationService.createAsync(userDetails.id, {
          type: 'payment_account_creation',
          data: { completed: false, reason: detail },
        });

        throw new GrpcException(code, detail);
      }

      throw e;
    }

    await this.primeKycManager.verifyDocuments(account.user_id, account.uuid);

    return { uuid: account.uuid, status: account.status, name: account.name, number: account.number };
  }

  async saveAccount(accountData: AccountType, user_id: number): Promise<PrimeTrustAccountEntity> {
    const accountPayload: PrimeTrustAccountEntity = {
      user_id,
      uuid: accountData.id,
      name: accountData.attributes.name,
      number: accountData.attributes.number,
      contributions_frozen: accountData.attributes['contributions-frozen'],
      disbursements_frozen: accountData.attributes['disbursements-frozen'],
      statements: accountData.attributes['statements'],
      solid_freeze: accountData.attributes['solid-freeze'],
      offline_cold_storage: accountData.attributes['offline-cold-storage'],
      status: accountData.attributes.status,
    };
    const account = await this.primeAccountRepository.save(this.primeAccountRepository.create(accountPayload));

    return account;
  }

  async updateAccount(id: string): Promise<SuccessResponse> {
    const accountData = await this.primeAccountRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect(UserEntity, 'u', 'a.user_id = u.id')
      .select(['a.uuid as account_id,u.id as user_id'])
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
    if (accountResponse.status === 'opened') {
      this.notificationService.createAsync(user_id, {
        type: 'payment_account_creation',
        data: { completed: true },
      });
    }

    return { success: true };
  }

  async getAccountInfo(account_id: string) {
    try {
      const accountResponse = await this.httpService.request({
        method: 'get',
        url: `${this.prime_trust_url}/v2/accounts/${account_id}`,
      });

      return accountResponse.data.data.attributes;
    } catch (e) {
      throw new GrpcException(Status.ABORTED, e.response?.data.errors[0] ?? e.message, 400);
    }
  }

  async getAccount(id: number): Promise<AccountResponse> {
    const account = await this.primeAccountRepository.findOneByOrFail({ user_id: id });

    return {
      uuid: account.uuid,
      name: account.name,
      status: account.status,
      number: account.number,
    };
  }

  async createAgreement(userDetails: AgreementRequest): Promise<UserAgreement> {
    if (userDetails.country_code === 'US' && userDetails.details) {
      this.countryService.checkUSA(userDetails.details);
    }
    const formData = {
      data: {
        type: 'agreement-previews',
        attributes: {
          name: 'string',
          'authorized-signature': 'string',
          'account-type': 'custodial',
          owner: {
            'contact-type': 'natural_person',
            name: `${userDetails.details.first_name} ${userDetails.details.last_name}`,
            email: `${userDetails.email}`,
            'tax-id-number': `${userDetails.details.tax_id_number}`,
            'tax-country': `${userDetails.country_code}`,
            'date-of-birth': `${userDetails.details.date_of_birth}`,
            'primary-phone-number': {
              country: `${userDetails.country_code}`,
              number: `${userDetails.phone}`,
              sms: true,
            },
            'primary-address': {
              'street-1': `${userDetails.details.street}`,
              'postal-code': `${userDetails.details.postal_code}`,
              city: `${userDetails.details.city}`,
              region: `${userDetails.details.region}`,
              country: `${userDetails.country_code}`,
            },
          },
        },
      },
    };
    try {
      const agreementResponse = await this.httpService.request({
        method: 'post',
        url: `${this.prime_trust_url}/v2/agreement-previews`,
        data: formData,
      });
      const agreementData = agreementResponse.data.data;

      return { id: agreementData.id, content: agreementData.attributes.content };
    } catch (e) {
      this.logger.error(e.errors);

      if (e instanceof PrimeTrustException) {
        const { detail, code } = e.getFirstError();

        throw new GrpcException(code, detail);
      } else {
        throw new GrpcException(Status.ABORTED, 'Connection error!', 400);
      }
    }
  }

  async getUserAccountStatus({ id }: IdRequest): Promise<AccountStatusResponse> {
    const user = await this.userService.get(id);

    return { status: user.status };
  }

  async processAccountsData(startIndex: number, batchSize: number): Promise<void> {
    const accountsData: { account_id: string; unit_count: string }[] = await this.primeAccountRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect(PrimeTrustBalanceEntity, 'b', 'a.user_id = b.user_id')
      .select(['a.uuid as account_id', 'b.cold_balance as unit_count'])
      .skip(startIndex)
      .take(batchSize)
      .getRawMany();

    const sendData = accountsData.map((a) => {
      const formData = {
        data: {
          type: 'sub-asset-transfers',
          attributes: {
            'unit-count': a.unit_count,
            'account-id': a.account_id,
            'asset-id': process.env.ASSET_ID,
          },
        },
      };

      return this.httpService.request({
        method: 'post',
        url: `${this.prime_trust_url}/v2/sub-asset-transfers`,
        data: formData,
      });
    });

    await Promise.all(sendData).catch((e) => this.logger.log(e));

    if (process.env.NODE_ENV === 'dev') {
      const subAssetTransfers = await this.httpService.request({
        method: 'get',
        url: `${this.prime_trust_url}/v2/sub-asset-transfers`,
        data: null,
      });

      if (subAssetTransfers.data) {
        subAssetTransfers.data.data.map((a: { id: string; attributes: { status: string } }) => {
          if (a.attributes.status === 'pending') {
            this.httpService.request({
              method: 'post',
              url: `${this.prime_trust_url}/v2/sub-asset-transfers/${a.id}/sandbox/settle`,
              data: null,
            });
          }
        });
      }
    }

    if (accountsData.length === batchSize) {
      await this.processAccountsData(startIndex + batchSize, batchSize);
    }
  }

  async transferToHotWallet(): Promise<SuccessResponse> {
    this.processAccountsData(0, 1000);

    return { success: true };
  }
}
