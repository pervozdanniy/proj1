import { NotificationService } from '@/notification/services/notification.service';
import { PrimeTrustAccountEntity } from '@/payment-gateway/entities/prime_trust/prime-trust-account.entity';
import { PrimeTrustContactEntity } from '@/payment-gateway/entities/prime_trust/prime-trust-contact.entity';
import { PrimeTrustKycDocumentEntity } from '@/payment-gateway/entities/prime_trust/prime-trust-kyc-document.entity';
import { PrimeTrustException } from '@/payment-gateway/request/exception/prime-trust.exception';
import { PrimeTrustHttpService } from '@/payment-gateway/request/prime-trust-http.service';
import { ContactType, DocumentCheckType, DocumentDataType, FileType } from '@/payment-gateway/types/prime-trust';
import { UserEntity } from '@/user/entities/user.entity';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import FormData from 'form-data';
import { IsNull, Not, Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import { AccountIdRequest, DocumentResponse, SocureDocumentRequest } from '~common/grpc/interfaces/payment-gateway';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { SocureDocumentEntity } from '../../../entities/socure-document.entity';

@Injectable()
export class PrimeKycManager {
  private readonly logger = new Logger(PrimeKycManager.name);
  private readonly prime_trust_url: string;
  constructor(
    config: ConfigService<ConfigInterface>,
    private readonly httpService: PrimeTrustHttpService,
    private readonly notificationService: NotificationService,

    @InjectRepository(PrimeTrustAccountEntity)
    private readonly primeAccountRepository: Repository<PrimeTrustAccountEntity>,

    @InjectRepository(PrimeTrustContactEntity)
    private readonly primeTrustContactEntityRepository: Repository<PrimeTrustContactEntity>,

    @InjectRepository(PrimeTrustKycDocumentEntity)
    private readonly primeTrustKycDocumentEntityRepository: Repository<PrimeTrustKycDocumentEntity>,

    @InjectRepository(SocureDocumentEntity)
    private readonly primeTrustSocureDocumentEntityRepository: Repository<SocureDocumentEntity>,
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

  async saveContact(contactData: any, user_id: number) {
    const data = this.collectContactData(contactData);
    await this.primeTrustContactEntityRepository.save(
      this.primeTrustContactEntityRepository.create({
        user_id,
        ...data,
      }),
    );

    return { success: true };
  }

  async uploadDocument(userDetails: UserEntity, file: any, label: string): Promise<DocumentResponse> {
    const country_code = userDetails.country_code;
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

  async sendDocument(file: FileType, label: string, contact_uuid: string) {
    const bodyFormData = new FormData();
    bodyFormData.append('contact-id', contact_uuid);
    bodyFormData.append('label', label);
    bodyFormData.append('public', 'false');
    bodyFormData.append('file', file.buffer, file.originalname);

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

  async saveDocument(documentData: DocumentDataType, user_id: number, documentCheckResponse: DocumentCheckType) {
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
        await this.primeTrustKycDocumentEntityRepository.save(
          this.primeTrustKycDocumentEntityRepository.create({
            user_id,
            uuid: documentData.data.attributes['socure-reference-id'],
            label: documentData.data.attributes['kyc-document-type'],
            kyc_check_uuid: documentData.data.id,
            status: documentData.data.attributes['status'],
          }),
        );
        await this.primeTrustKycDocumentEntityRepository.update(
          { kyc_check_uuid: documentData.data.id },
          {
            status: documentData.data.attributes.status,
            failure_details: documentData.data.attributes['failure-details'],
          },
        );
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
      let status = false;
      if (data.identity_documents_verified) {
        status = true;
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
      if (e instanceof PrimeTrustException) {
        const { detail, code } = e.getFirstError();

        throw new GrpcException(code, detail);
      } else {
        throw new GrpcException(Status.ABORTED, e.message, 400);
      }
    }
  }

  async cipCheck(id: string, resource_id: string): Promise<SuccessResponse> {
    const accountData = await this.primeAccountRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect(UserEntity, 'u', 'a.user_id = u.id')
      .leftJoinAndSelect('a.contact', 'c')
      .select(['c.uuid as contact_id'])
      .where('a.uuid = :id', { id })
      .getRawOne();

    const { contact_id } = accountData;

    const cipResponse = await this.getCipCheckInfo(resource_id);
    if (process.env.NODE_ENV === 'dev') {
      // approve cip for development
      if (cipResponse === 'pending') {
        await this.httpService.request({
          method: 'post',
          url: `${this.prime_trust_url}/v2/cip-checks/${resource_id}/sandbox/approve`,
          data: null,
        });
      }
    }

    if (cipResponse === 'approved') {
      await this.updateContact({ id, resource_id: contact_id });
    }

    return { success: true };
  }

  private async getCipCheckInfo(cip_check_id: string) {
    try {
      const cipResponse = await this.httpService.request({
        method: 'get',
        url: `${this.prime_trust_url}/v2/cip-checks/${cip_check_id}`,
      });

      return cipResponse.data.data.attributes;
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

  async createSocureDocument(request: SocureDocumentRequest): Promise<SuccessResponse> {
    const { user_id } = request;
    try {
      await this.primeTrustSocureDocumentEntityRepository.save(
        this.primeTrustSocureDocumentEntityRepository.create(request),
      );
      await this.notificationService.sendWs(user_id, 'socure', 'Document successfully uploaded!', 'Socure document');
    } catch (e) {
      this.logger.log(e.message);
    }

    return { success: true };
  }

  async updateContact({ id: account_id, resource_id }: AccountIdRequest): Promise<SuccessResponse> {
    const contactData = await this.getContactByUuid(resource_id);

    const account = await this.primeAccountRepository.findOneBy({ uuid: account_id });
    const contact = await this.primeTrustContactEntityRepository.findOneBy({ uuid: contactData.data.id });
    if (!contact) {
      await this.saveContact(contactData.data, account.user_id);
    } else {
      const collectedData = this.collectContactData(contactData.data);
      await this.primeTrustContactEntityRepository.update({ uuid: resource_id }, collectedData);
    }

    return { success: true };
  }

  async getContactByUuid(uuid: string): Promise<{ data: ContactType }> {
    const contactData = await this.httpService.request({
      method: 'get',
      url: `${this.prime_trust_url}/v2/contacts/${uuid}`,
    });

    return contactData.data;
  }
}
