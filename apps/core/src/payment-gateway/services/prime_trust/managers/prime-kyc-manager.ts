import { NotificationService } from '@/notification/services/notification.service';
import { PrimeTrustAccountEntity } from '@/payment-gateway/entities/prime_trust/prime-trust-account.entity';
import { PrimeTrustContactEntity } from '@/payment-gateway/entities/prime_trust/prime-trust-contact.entity';
import { PrimeTrustKycDocumentEntity } from '@/payment-gateway/entities/prime_trust/prime-trust-kyc-document.entity';
import { PrimeTrustException } from '@/payment-gateway/request/exception/prime-trust.exception';
import { PrimeTrustHttpService } from '@/payment-gateway/request/prime-trust-http.service';
import { ContactType, DocumentCheckType, DocumentDataType } from '@/payment-gateway/types/prime-trust';
import { UserEntity } from '@/user/entities/user.entity';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import FormData from 'form-data';
import process from 'process';
import { IsNull, Not, Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import { AccountIdRequest } from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { UserService } from '../../../../user/services/user.service';
import { PrimeVeriffManager } from './prime-veriff-manager';

@Injectable()
export class PrimeKycManager {
  private readonly logger = new Logger(PrimeKycManager.name);
  private readonly prime_trust_url: string;
  constructor(
    config: ConfigService<ConfigInterface>,
    private userService: UserService,
    private readonly httpService: PrimeTrustHttpService,
    private readonly notificationService: NotificationService,
    private readonly primeVeriffManager: PrimeVeriffManager,

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
    };

    try {
      const contactResponse = await this.httpService.request({
        method: 'post',
        url: `${this.prime_trust_url}/v2/contacts`,
        data: formData,
      });

      return await this.saveContact(contactResponse.data, userDetails.id);
    } catch (e) {
      if (e instanceof PrimeTrustException) {
        const { detail, code } = e.getFirstError();

        throw new GrpcException(code, detail);
      } else {
        throw new GrpcException(Status.ABORTED, 'Connection error!', 400);
      }
    }
  }

  collectContactData(contactData: ContactType) {
    return {
      uuid: contactData.id,
      first_name: contactData.attributes['first-name'],
      last_name: contactData.attributes['last-name'],
      middle_name: contactData.attributes['middle-name'],
      identity_fingerprint: contactData.attributes['identity-fingerprint'],
      proof_of_address_documents_verified: contactData.attributes['proof-of-address-documents-verified'],
      identity_documents_verified: contactData.attributes['identity-documents-verified'],
      aml_cleared: contactData.attributes['aml-cleared'],
      cip_cleared: contactData.attributes['cip-cleared'],
      identity_confirmed: contactData.attributes['identity-confirmed'],
    };
  }

  async saveContact(contactData: ContactType, user_id: number) {
    const data = this.collectContactData(contactData);
    await this.primeTrustContactEntityRepository.save(
      this.primeTrustContactEntityRepository.create({
        user_id,
        ...data,
      }),
    );

    return { success: true };
  }

  async passVerification(user_id: number, account_id: string) {
    const user = await this.userService.get(user_id);
    const contact = await this.getContactByAccount(account_id);

    const mediaFiles = await this.primeVeriffManager.getMedia(user.id);
    for (const m of mediaFiles) {
      const documentResponse = await this.send(m.buffer, m.name + '.jpg', `${m.name}  ${m.label}`, contact.id);
      if (m.name === 'document-front' || m.name === 'document-back') {
        const documentCheckResponse = await this.kycDocumentCheck(
          documentResponse.data.id,
          contact.id,
          m.label,
          user.country_code,
        );
        if (process.env.NODE_ENV === 'dev') {
          await this.verifyDocument(documentCheckResponse.data.id);
        }

        await this.saveDocument(documentResponse.data, user.id, documentCheckResponse.data);
      }
    }
  }

  async verifyDocument(document_id: string) {
    try {
      await this.httpService.request({
        method: 'post',
        url: `${this.prime_trust_url}/v2/kyc-document-checks/${document_id}/sandbox/verify`,
        data: null,
      });
    } catch (e) {
      throw new GrpcException(Status.ABORTED, 'Document verify error,sandbox!', 400);
    }
  }

  async kycDocumentCheck(document_uuid: string, contact_uuid: string, label: string, country_code: string) {
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
      const result = await this.httpService.request({
        method: 'post',
        url: `${this.prime_trust_url}/v2/kyc-document-checks`,
        data: formData,
      });

      return result.data;
    } catch (e) {
      this.logger.error(e);

      if (e instanceof PrimeTrustException) {
        const { detail, code } = e.getFirstError();

        throw new GrpcException(code, detail);
      } else {
        throw new GrpcException(Status.ABORTED, 'Connection error!', 400);
      }
    }
  }
  async saveDocument(documentData: DocumentDataType, user_id: number, documentCheckResponse: DocumentCheckType) {
    try {
      const payload = {
        user_id,
        uuid: documentData.id,
        file_url: documentData.attributes['file-url'],
        extension: documentData.attributes['extension'],
        label: documentData.attributes['label'],
        kyc_check_uuid: documentCheckResponse.id,
        status: documentCheckResponse.attributes.status,
      };
      await this.primeTrustKycDocumentEntityRepository.save(this.primeTrustKycDocumentEntityRepository.create(payload));
    } catch (e) {
      if (e instanceof PrimeTrustException) {
        const { detail, code } = e.getFirstError();

        throw new GrpcException(code, detail);
      } else {
        throw new GrpcException(Status.ABORTED, 'Connection error!', 400);
      }
    }

    return { document_id: documentCheckResponse.id };
  }

  async documentCheck({ resource_id, id }: AccountIdRequest): Promise<SuccessResponse> {
    try {
      const accountData = await this.primeAccountRepository
        .createQueryBuilder('a')
        .leftJoinAndSelect(UserEntity, 'u', 'a.user_id = u.id')
        .leftJoinAndSelect('a.contact', 'c')
        .select(['a.uuid as account_id', 'c.uuid as contact_id', 'u.id as user_id'])
        .where('a.uuid = :id', { id })
        .getRawOne();

      const { contact_id, user_id } = accountData;

      const { data: documentData } = await this.httpService.request({
        method: 'get',
        url: `${this.prime_trust_url}/v2/kyc-document-checks/${resource_id}`,
      });

      if (documentData.data) {
        const document = await this.primeTrustKycDocumentEntityRepository.findOneBy({
          kyc_check_uuid: documentData.data.id,
        });
        if (document) {
          await this.primeTrustKycDocumentEntityRepository.update(
            { kyc_check_uuid: documentData.data.id },
            {
              status: documentData.data.attributes.status,
              failure_details: documentData.data.attributes['failure-details'],
            },
          );
        }
      }

      const contactResponse = await this.getContactByUuid(contact_id);

      const contact = await this.primeTrustContactEntityRepository.findOne({
        where: { uuid: contactResponse.data.id },
      });

      const data = this.collectContactData(contactResponse.data);
      await this.primeTrustContactEntityRepository.save({
        ...contact,
        ...data,
      });

      const notificationPayload = {
        user_id,
        title: 'User Documents',
        type: 'kyc_document_checks',
        description: `Documents verification ${documentData.data.attributes.status}`,
      };
      this.notificationService.createAsync(notificationPayload);
      await this.notificationService.sendWs(
        user_id,
        'kyc',
        JSON.stringify({ status: documentData.data.attributes.status }),
        'Document',
      );

      return { success: true };
    } catch (e) {
      if (e instanceof PrimeTrustException) {
        const { detail, code } = e.getFirstError();

        throw new GrpcException(code, detail);
      } else {
        throw new GrpcException(Status.ABORTED, 'Connection error!', 400);
      }
    }
  }

  async cipCheck(id: string, resource_id: string): Promise<SuccessResponse> {
    const cipResponse = await this.getCipCheckInfo(resource_id);

    if (process.env.NODE_ENV === 'dev') {
      // approve cip for development
      if (cipResponse.data.attributes.status === 'pending') {
        await this.httpService.request({
          method: 'post',
          url: `${this.prime_trust_url}/v2/cip-checks/${resource_id}/sandbox/approve`,
          data: null,
        });
      }
    }

    if (cipResponse.status === 'approved') {
      await this.updateContact({ id, resource_id: cipResponse.included[0].id });
    }

    return { success: true };
  }

  private async getCipCheckInfo(cip_check_id: string) {
    try {
      const cipResponse = await this.httpService.request({
        method: 'get',
        url: `${this.prime_trust_url}/v2/cip-checks/${cip_check_id}?include=contact`,
      });

      return cipResponse.data;
    } catch (e) {
      if (e instanceof PrimeTrustException) {
        const { detail, code } = e.getFirstError();

        throw new GrpcException(code, detail);
      } else {
        throw new GrpcException(Status.ABORTED, 'Connection error!', 400);
      }
    }
  }

  async getContact(id: number): Promise<PrimeTrustContactEntity> {
    return await this.primeTrustContactEntityRepository.findOneBy({ user_id: id });
  }

  async updateContact({ id: account_id, resource_id }: AccountIdRequest): Promise<SuccessResponse> {
    const contactData = await this.getContactByUuid(resource_id);

    const account = await this.primeAccountRepository.findOneBy({ uuid: account_id });
    const contact = await this.primeTrustContactEntityRepository.findOneBy({ uuid: contactData.data.id });
    if (account) {
      if (!contact) {
        await this.saveContact(contactData.data, account.user_id);
      } else {
        const collectedData = this.collectContactData(contactData.data);
        await this.primeTrustContactEntityRepository.update({ uuid: resource_id }, collectedData);
      }
    }

    // const contactUploadedImagesResponse = await this.httpService.request({
    //   method: 'get',
    //   url: `${this.prime_trust_url}/v2/uploaded-documents?contact.id=${contactData.data.id}`,
    // });

    // for (const u of contactUploadedImagesResponse.data.data) {
    //   await this.primeTrustKycDocumentEntityRepository.save(
    //     this.primeTrustKycDocumentEntityRepository.create({
    //       user_id: account.user_id,
    //       uuid: u.id,
    //       file_url: u.attributes['file-url'],
    //       extension: u.attributes['extension'],
    //       label: u.attributes['label'],
    //       status: u.attributes.status,
    //     }),
    //   );
    // }

    return { success: true };
  }

  async send(buffer: Buffer, name: string, label: string, contact_uuid: string) {
    const bodyFormData = new FormData();
    bodyFormData.append('contact-id', contact_uuid);
    bodyFormData.append('label', label);
    bodyFormData.append('public', 'false');
    bodyFormData.append('file', buffer, name);

    try {
      const result = await this.httpService.request({
        method: 'post',
        url: `${this.prime_trust_url}/v2/uploaded-documents`,
        data: bodyFormData,
        headers: {
          ...bodyFormData.getHeaders(),
        },
      });

      return result.data;
    } catch (e) {
      if (e instanceof PrimeTrustException) {
        const { detail, code } = e.getFirstError();

        throw new GrpcException(code, detail);
      } else {
        throw new GrpcException(Status.ABORTED, 'Connection error!', 400);
      }
    }
  }

  async getContactByUuid(uuid: string): Promise<{ data: ContactType }> {
    const contactData = await this.httpService.request({
      method: 'get',
      url: `${this.prime_trust_url}/v2/contacts/${uuid}`,
    });

    return contactData.data;
  }

  private async getContactByAccount(account_id: string): Promise<ContactType> {
    const contactData = await this.httpService.request({
      method: 'get',
      url: `${this.prime_trust_url}/v2/accounts/${account_id}?include=contacts`,
    });

    return contactData.data.included[0];
  }
}
