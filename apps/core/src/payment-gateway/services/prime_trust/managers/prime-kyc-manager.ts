import { Status } from '@grpc/grpc-js/build/src/constants';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import FormData from 'form-data';
import process from 'process';
import { IsNull, Not, Repository } from 'typeorm';
import { PrimeTrustHttpService } from '~common/axios/prime-trust-http.service';
import { ConfigInterface } from '~common/config/configuration';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { NotificationService } from '~svc/core/src/notification/services/notification.service';
import { PrimeTrustAccountEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-account.entity';
import { PrimeTrustContactEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-contact.entity';
import { PrimeTrustKycDocumentEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-kyc-document.entity';
import { PrimeTokenManager } from '~svc/core/src/payment-gateway/services/prime_trust/managers/prime-token.manager';
import { UserEntity } from '~svc/core/src/user/entities/user.entity';

@Injectable()
export class PrimeKycManager {
  private readonly logger = new Logger(PrimeKycManager.name);
  private readonly prime_trust_url: string;
  constructor(
    private config: ConfigService<ConfigInterface>,
    private readonly httpService: PrimeTrustHttpService,
    private readonly notificationService: NotificationService,
    @Inject(PrimeTokenManager)
    private readonly primeTokenManager: PrimeTokenManager,

    @InjectRepository(PrimeTrustAccountEntity)
    private readonly primeAccountRepository: Repository<PrimeTrustAccountEntity>,

    @InjectRepository(PrimeTrustContactEntity)
    private readonly primeTrustContactEntityRepository: Repository<PrimeTrustContactEntity>,

    @InjectRepository(PrimeTrustKycDocumentEntity)
    private readonly primeTrustKycDocumentEntityRepository: Repository<PrimeTrustKycDocumentEntity>,
  ) {
    const { prime_trust_url } = config.get('app');
    this.prime_trust_url = prime_trust_url;
  }

  async createContact(userDetails: UserEntity) {
    const contact = await this.primeTrustContactEntityRepository.findOne({
      where: { user_id: userDetails.id },
    });
    if (contact) {
      throw new GrpcException(Status.ALREADY_EXISTS, 'Contact already exist!', 400);
    }

    const account = await this.primeAccountRepository.findOne({ where: { uuid: Not(IsNull()) } });

    const formData = {
      data: {
        type: 'contacts',
        attributes: {
          'account-id': account.uuid,
          account_roles: ['owner'],
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
    };

    try {
      const contactResponse = await this.httpService.axios({
        method: 'post',
        url: `${this.prime_trust_url}/v2/contacts`,
        data: formData,
      });

      return await this.saveContact(contactResponse.data, userDetails.id);
    } catch (e) {
      throw new GrpcException(Status.ABORTED, e.message, 400);
    }
  }

  collectContractData(contactData) {
    return {
      uuid: contactData.data.id,
      first_name: contactData.data.attributes['first-name'],
      last_name: contactData.data.attributes['last-name'],
      middle_name: contactData.data.attributes['middle-name'],
      identity_fingerprint: contactData.data.attributes['identity-fingerprint'],
      proof_of_address_documents_verified: contactData.data.attributes['proof-of-address-documents-verified'],
      identity_documents_verified: contactData.data.attributes['identity-documents-verified'],
      aml_cleared: contactData.data.attributes['aml-cleared'],
      cip_cleared: contactData.data.attributes['cip-cleared'],
      identity_confirmed: contactData.data.attributes['identity-confirmed'],
    };
  }

  async saveContact(contactData, user_id) {
    const data = this.collectContractData(contactData);
    await this.primeTrustContactEntityRepository.save(
      this.primeTrustContactEntityRepository.create({
        user_id,
        ...data,
      }),
    );

    return { success: true };
  }

  async uploadDocument(userDetails: UserEntity, file: any, label: string) {
    const country_code = userDetails.country.code;
    const account = await this.primeAccountRepository.findOne({
      where: { user_id: userDetails.id },
      relations: ['contact'],
    });

    const documentResponse = await this.sendDocument(file, label, account.contact.uuid);

    const documentCheckResponse = await this.kycDocumentCheck(
      documentResponse.data.id,
      account.contact.uuid,
      label,
      country_code,
    );

    return this.saveDocument(documentResponse.data, account.contact.user_id, documentCheckResponse.data);
  }

  async kycDocumentCheck(document_uuid, contact_uuid, label, country_code) {
    const formData = {
      data: {
        type: 'kyc-document-checks',
        attributes: {
          'contact-id': contact_uuid,
          'uploaded-document-id': document_uuid,
          identity: true,
          'identity-photo': true,
          'proof-of-address': true,
          'kyc-document-country': country_code,
          'kyc-document-type': label,
        },
      },
    };

    try {
      const result = await this.httpService.axios({
        method: 'post',
        url: `${this.prime_trust_url}/v2/kyc-document-checks`,
        data: formData,
      });

      const contactData = await this.httpService.axios({
        method: 'get',
        url: `${this.prime_trust_url}/v2/contacts/${contact_uuid}?include=cip-checks`,
      });

      //document verify from development
      if (process.env.NODE_ENV === 'dev') {
        await this.httpService.axios({
          method: 'post',
          url: `${this.prime_trust_url}/v2/kyc-document-checks/${result.data.data.id}/sandbox/verify`,
          data: null,
        });

        // approve cip for development
        contactData.data.included.map(async (inc) => {
          if (inc.type === 'cip-checks' && inc.attributes.status === 'pending') {
            await this.httpService.axios({
              method: 'post',
              url: `${this.prime_trust_url}/v2/cip-checks/${inc.id}/sandbox/approve`,
              data: null,
            });
          }
        });
      }

      return result.data;
    } catch (e) {
      this.logger.error(e);

      throw new GrpcException(Status.ABORTED, e.response.data, 400);
    }
  }

  async sendDocument(file, label, contact_uuid) {
    const bodyFormData = new FormData();
    bodyFormData.append('contact-id', contact_uuid);
    bodyFormData.append('label', label);
    bodyFormData.append('public', 'false');
    bodyFormData.append('file', file.buffer, file.originalname);

    try {
      const result = await this.httpService.axios({
        method: 'post',
        url: `${this.prime_trust_url}/v2/uploaded-documents`,
        data: bodyFormData,
        headers: {
          ...bodyFormData.getHeaders(),
        },
      });

      return result.data;
    } catch (e) {
      this.logger.error(e.response.data);

      throw new GrpcException(Status.ABORTED, e.response.data, 400);
    }
  }

  async saveDocument(documentData, user_id, documentCheckResponse) {
    try {
      await this.primeTrustKycDocumentEntityRepository.save(
        this.primeTrustKycDocumentEntityRepository.create({
          user_id,
          uuid: documentData.id,
          file_url: documentData.attributes['file-url'],
          extension: documentData.attributes['extension'],
          label: documentData.attributes['label'],
          kyc_check_uuid: documentCheckResponse.id,
          status: documentCheckResponse.attributes.status,
        }),
      );
    } catch (e) {
      this.logger.error(e.message);

      throw new GrpcException(Status.ABORTED, e.message, 400);
    }

    return { success: true };
  }

  async documentCheck(id: string): Promise<SuccessResponse> {
    try {
      const accountData = await this.primeAccountRepository
        .createQueryBuilder('a')
        .leftJoinAndSelect(UserEntity, 'u', 'a.user_id = u.id')
        .leftJoinAndSelect('a.contact', 'c')
        .leftJoinAndSelect('c.documents', 'd')
        .select([
          'd.kyc_check_uuid as kyc_check_uuid,' + 'a.uuid as account_id,' + 'c.uuid as contact_id,' + 'u.id as user_id',
        ])
        .where('a.uuid = :id', { id })
        .getRawOne();

      if (!accountData) {
        throw new GrpcException(Status.NOT_FOUND, `Account by ${id} id not found`, 400);
      }

      const { contact_id, user_id, kyc_check_uuid } = accountData;

      const result = await this.httpService.axios({
        method: 'get',
        url: `${this.prime_trust_url}/v2/kyc-document-checks/${kyc_check_uuid}`,
      });

      if (result.data) {
        await this.primeTrustKycDocumentEntityRepository.update(
          { kyc_check_uuid: result.data.data.id },
          {
            status: result.data.data.attributes.status,
            failure_details: result.data.data.attributes['failure-details'],
          },
        );
      }

      const contactResponse = await this.httpService.axios({
        method: 'get',
        url: `${this.prime_trust_url}/v2/contacts`,
      });

      const cData = contactResponse.data.data.find((c) => {
        return c.id === contact_id;
      });

      const contactData = { data: cData };

      const contact = await this.primeTrustContactEntityRepository.findOne({
        where: { uuid: contactData.data.id },
      });

      const data = this.collectContractData(contactData);
      await this.primeTrustContactEntityRepository.save({
        ...contact,
        ...data,
      });
      let status = 'failed';
      if (data.identity_documents_verified) {
        status = 'succeed';
      }

      const notificationPayload = {
        user_id,
        title: 'User Documents',
        type: 'kyc_document_checks',
        description: `Documents verification ${status}`,
      };
      this.notificationService.createAsync(notificationPayload);

      return { success: true };
    } catch (e) {
      this.logger.error(e.message);

      throw new GrpcException(Status.ABORTED, e.message, 400);
    }
  }

  async cipCheck(id: string, resource_id: string) {
    const accountData = await this.primeAccountRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect(UserEntity, 'u', 'a.user_id = u.id')
      .select(['u.id as user_id'])
      .where('a.uuid = :id', { id })
      .getRawOne();

    const { user_id } = accountData;

    const cipResponse = await this.getCipCheckInfo(resource_id);
    const notificationPayload = {
      user_id,
      title: 'User Documents',
      type: 'cip_checks',
      description: `Phone verification status ${cipResponse.status}`,
    };
    this.notificationService.createAsync(notificationPayload);

    return { success: true };
  }

  private async getCipCheckInfo(cip_check_id) {
    try {
      const cipResponse = await this.httpService.axios({
        method: 'get',
        url: `${this.prime_trust_url}/v2/cip-checks/${cip_check_id}`,
      });

      return cipResponse.data.data.attributes;
    } catch (e) {
      this.logger.error(e.response.data);

      throw new GrpcException(Status.ABORTED, e.response.data, 400);
    }
  }
}
