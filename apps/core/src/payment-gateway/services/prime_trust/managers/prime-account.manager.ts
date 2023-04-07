import { PrimeTrustAccountEntity } from '@/payment-gateway/entities/prime_trust/prime-trust-account.entity';
import { PrimeTrustException } from '@/payment-gateway/request/exception/prime-trust.exception';
import { PrimeTrustHttpService } from '@/payment-gateway/request/prime-trust-http.service';
import { PrimeKycManager } from '@/payment-gateway/services/prime_trust/managers/prime-kyc-manager';
import {AccountType, ContactType} from '@/payment-gateway/types/prime-trust';
import { UserEntity } from '@/user/entities/user.entity';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { IdRequest, SuccessResponse, UserAgreement } from '~common/grpc/interfaces/common';
import { AccountResponse, AccountStatusResponse, AgreementRequest } from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { CountryService } from '../../../../country/country.service';
import { UserService } from '../../../../user/services/user.service';
import {PrimeTrustSocureDocumentEntity} from "../../../entities/prime_trust/prime-trust-socure-document.entity";

@Injectable()
export class PrimeAccountManager {
  private readonly logger = new Logger(PrimeAccountManager.name);
  private readonly prime_trust_url: string;
  private readonly app_domain: string;

  constructor(
    config: ConfigService<ConfigInterface>,
    private readonly httpService: PrimeTrustHttpService,

    private readonly primeKycManager: PrimeKycManager,

    private countryService: CountryService,

    private userService: UserService,

    @InjectRepository(PrimeTrustAccountEntity)
    private readonly primeAccountRepository: Repository<PrimeTrustAccountEntity>,

    @InjectRepository(PrimeTrustSocureDocumentEntity)
    private readonly primeTrustSocureDocumentEntityRepository: Repository<PrimeTrustSocureDocumentEntity>,
  ) {
    const { prime_trust_url, domain } = config.get('app');
    this.prime_trust_url = prime_trust_url;
    this.app_domain = domain;
  }

  async createAccount(userDetails: UserEntity): Promise<AccountResponse> {
    const account = await this.primeAccountRepository.findOne({ where: { user_id: userDetails.id } });
    if (account) {
      throw new GrpcException(Status.ALREADY_EXISTS, 'Account already exist', 400);
    }

    let formData = {
      data: {
        type: 'account',
        attributes: {
          'account-type': 'custodial',
          name: `${userDetails.details.first_name} ${userDetails.details.last_name}s Account`,
          'authorized-signature': `Signature ${userDetails.email}`,
          owner: {
            'socure-document-id':"",
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

    const socureDocument = await this.primeTrustSocureDocumentEntityRepository.findOneBy({user_id:userDetails.id,status:'VERIFICATION_COMPLETE'})
    if(socureDocument){
      formData.data.attributes.owner["socure-document-id"] = socureDocument.uuid;
    }
    try {
      const accountResponse = await this.httpService.request({
        method: 'post',
        url: `${this.prime_trust_url}/v2/accounts`,
        data: formData,
      });

      //hang webhook on account
      await this.hangWebhook(userDetails, accountResponse.data.data.id);
      //

      // account open from development
      // if (process.env.NODE_ENV === 'dev') {
      //   await this.httpService.request({
      //     method: 'post',
      //     url: `${this.prime_trust_url}/v2/accounts/${accountResponse.data.data.id}/sandbox/open`,
      //     data: null,
      //   });
      // }
      //

      //create contact after creating account
      const account = await this.saveAccount(accountResponse.data.data, userDetails.id);

      const contactResponse = await this.httpService.request({
        method: 'get',
        url: `${this.prime_trust_url}/v2/contacts`,
      });
      const contactData = contactResponse.data.data.filter((contact: ContactType) => {
        return contact.attributes['account-id'] === account.uuid;
      });

      // if (process.env.NODE_ENV === 'dev') {
      //
      //   const contactCipData = await this.httpService.request({
      //     method: 'get',
      //     url: `${this.prime_trust_url}/v2/contacts/${contactData[0].id}?include=cip-checks`,
      //   });
      //
      //   // approve cip for development
      //   contactCipData.data.included.map(async (inc: CipCheckType) => {
      //     if (inc.type === 'cip-checks' && inc.attributes.status === 'pending') {
      //       await this.httpService.request({
      //         method: 'post',
      //         url: `${this.prime_trust_url}/v2/cip-checks/${inc.id}/sandbox/approve`,
      //         data: null,
      //       });
      //     }
      //   });
      // }

      await this.primeKycManager.saveContact(contactData.pop(), account.user_id);

      return { uuid: account.uuid, status: account.status, name: account.name, number: account.number };
      //
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

  async hangWebhook(userDetails: UserEntity, account_id: string) {
    // hang webhook on account
    await this.httpService.request({
      method: 'post',
      url: `${this.prime_trust_url}/v2/webhook-configs`,
      data: {
        data: {
          type: 'webhook-configs',
          attributes: {
            'contact-email': userDetails.email,
            url: `${this.app_domain}/webhook/prime_trust`,
            'account-id': account_id,
          },
        },
      },
    });
  }

  async saveAccount(accountData: AccountType, user_id: number): Promise<PrimeTrustAccountEntity> {
    try {
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
    } catch (e) {
      if (e instanceof PrimeTrustException) {
        const { detail, code } = e.getFirstError();

        throw new GrpcException(code, detail);
      } else {
        throw new GrpcException(Status.ABORTED, 'Connection error!', 400);
      }
    }
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
    const { account_id } = accountData;

    const accountResponse = await this.getAccountInfo(account_id);
    await this.primeAccountRepository.update(
      { uuid: account_id },
      {
        status: accountResponse.status,
      },
    );

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
      this.logger.error(e.response.data.errors[0]);

      throw new GrpcException(Status.ABORTED, e.response.data.errors[0], 400);
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
}
