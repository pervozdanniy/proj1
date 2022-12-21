import { Status } from '@grpc/grpc-js/build/src/constants';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { SuccessResponse } from '~common/grpc/interfaces/payment-gateway';
import { generatePassword } from '~common/helpers';
import { UserEntity } from '~svc/core/src/user/entities/user.entity';
import { PrimeTrustContactEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-contact.entity';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { PrimeTrustStatus } from '~svc/core/src/payment-gateway/constants/prime-trust.status';
import { PrimeTrustAccountEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-account.entity';
import { PrimeTrustUserEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-user.entity';
import { PrimeTrustKycDocumentEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-kyc-document.entity';
import FormData from 'form-data';

@Injectable()
export class PrimeTrustService {
  private readonly logger = new Logger(PrimeTrustService.name);
  constructor(
    private readonly httpService: HttpService,

    @InjectRepository(PrimeTrustUserEntity)
    private readonly primeUserRepository: Repository<PrimeTrustUserEntity>,

    @InjectRepository(PrimeTrustAccountEntity)
    private readonly primeAccountRepository: Repository<PrimeTrustAccountEntity>,

    @InjectRepository(PrimeTrustContactEntity)
    private readonly primeTrustContactEntityRepository: Repository<PrimeTrustContactEntity>,

    @InjectRepository(PrimeTrustKycDocumentEntity)
    private readonly primeTrustKycDocumentEntityRepository: Repository<PrimeTrustKycDocumentEntity>,
  ) {}

  async createPendingPrimeUser(password: string, user_id: number) {
    const user = await this.primeUserRepository.save(
      this.primeUserRepository.create({
        user_id,
        password,
        disabled: true,
        status: PrimeTrustStatus.PENDING,
      }),
    );

    return user;
  }

  async createUser(user) {
    const pg_password = generatePassword(true, true, 16);
    const prime_user = await this.createPendingPrimeUser(pg_password, user.id);
    const createData = {
      data: {
        type: 'user',
        attributes: {
          email: user.email,
          name: user.username,
          password: pg_password,
        },
      },
    };
    let response;

    try {
      response = await lastValueFrom(this.httpService.post('https://sandbox.primetrust.com/v2/users', createData));
    } catch (e) {
      this.logger.error(e.response.data.errors);

      throw new GrpcException(Status.ABORTED, e.response.data, 400);
    }

    await this.primeUserRepository.save({
      ...prime_user,
      uuid: response.data.data.id,
      status: PrimeTrustStatus.ACTIVE,
      disabled: response.data.data.attributes.disabled,
    });
  }

  async getToken(userDetails) {
    const headersRequest = {
      Authorization: `Basic ${Buffer.from(`${userDetails.email}:${userDetails.prime_user.password}`).toString(
        'base64',
      )}`,
    };

    const result = await lastValueFrom(
      this.httpService.post('https://sandbox.primetrust.com/auth/jwts', {}, { headers: headersRequest }),
    );

    return result.data;
  }

  async createAccount(userDetails, token) {
    const formData = {
      data: {
        type: 'account',
        attributes: {
          'account-type': 'custodial',
          name: `${userDetails.details.first_name} ${userDetails.details.last_name}s Account`,
          'authorized-signature': `${userDetails.prime_user.uuid}`,
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
    const headersRequest = {
      Authorization: `Bearer ${token}`,
    };

    try {
      const accountResponse = await lastValueFrom(
        this.httpService.post('https://sandbox.primetrust.com/v2/accounts', formData, { headers: headersRequest }),
      );

      const openResponse = await lastValueFrom(
        this.httpService.post(
          `https://sandbox.primetrust.com/v2/accounts/${accountResponse.data.data.id}/sandbox/open`,
          null,
          { headers: headersRequest },
        ),
      );

      return await this.saveAccount(openResponse.data.data, userDetails.prime_user.id);
    } catch (e) {
      this.logger.error(e.response.data.errors);

      throw new GrpcException(Status.ABORTED, e.response.data, 400);
    }
  }

  async saveAccount(accountData, user_id): Promise<SuccessResponse> {
    try {
      const accountPayload = {
        uuid: accountData.id,
        user_id,
        name: accountData.attributes.name,
        number: accountData.attributes.number,
        contributions_frozen: accountData.attributes['contributions-frozen'],
        disbursements_frozen: accountData.attributes['disbursements-frozen'],
        statements: accountData.attributes['contributions-frozen'],
        solid_freeze: accountData.attributes['solid-freeze'],
        offline_cold_storage: accountData.attributes['offline-cold-storage'],
        status: accountData.attributes.status,
      };
      await this.primeAccountRepository.save(this.primeAccountRepository.create(accountPayload));

      return { success: true };
    } catch (e) {
      throw new GrpcException(Status.ABORTED, e.message, 400);
    }
  }

  async createContact(userDetails: UserEntity, token: string) {
    const primeUser = userDetails.prime_user;
    const account = await this.primeAccountRepository.findOne({
      where: { user_id: primeUser.id },
      relations: ['contact'],
    });
    if (account.contact) {
      throw new GrpcException(Status.ALREADY_EXISTS, 'Contact already exist!', 400);
    }

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
    const headersRequest = {
      Authorization: `Bearer ${token}`,
    };

    try {
      const contactResponse = await lastValueFrom(
        this.httpService.post('https://sandbox.primetrust.com/v2/contacts', formData, { headers: headersRequest }),
      );

      return await this.saveContact(contactResponse.data, account.id);
    } catch (e) {
      throw new GrpcException(Status.ABORTED, e.message, 400);
    }
  }

  async saveContact(contactData, account_id) {
    await this.primeTrustContactEntityRepository.save(
      this.primeTrustContactEntityRepository.create({
        account_id,
        uuid: contactData.data.id,
        first_name: contactData.data.attributes['first-name'],
        last_name: contactData.data.attributes['last-name'],
        middle_name: contactData.data.attributes['middle-name'],
        identity_fingerprint: contactData.data.attributes['identity-fingerprint'],
        proof_of_address_documents_verified: contactData.data.attributes['proof-of-address-documents-verified'],
        identity_documents_verified: contactData.data.attributes['identity-documents-verified'],
        aml_cleared: contactData.data.attributes['aml-cleared'],
        cip_cleared: contactData.data.attributes['cip-cleared'],
      }),
    );

    return { success: true };
  }

  async uploadDocument(userDetails: UserEntity, file: any, label: string, token: string) {
    const country_code = userDetails.country.code;
    const primeUser = userDetails.prime_user;
    const account = await this.primeAccountRepository.findOne({
      where: { user_id: primeUser.id },
      relations: ['contact'],
    });

    const documentResponse = await this.sendDocument(file, label, token, account.contact.uuid);

    const documentCheckResponse = await this.kycDocumentCheck(
      documentResponse.data.id,
      account.contact.uuid,
      label,
      country_code,
      token,
    );

    return await this.saveDocument(documentResponse.data, account.contact.id, documentCheckResponse.data);
  }

  async kycDocumentCheck(document_uuid, contact_uuid, label, country_code, token) {
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

    const headersRequest = {
      Authorization: `Bearer ${token}`,
    };
    try {
      const result = await lastValueFrom(
        this.httpService.post('https://sandbox.primetrust.com/v2/kyc-document-checks', formData, {
          headers: headersRequest,
        }),
      );

      return result.data;
    } catch (e) {
      console.log(e.response.data);
    }
  }

  async sendDocument(file, label, token, contact_uuid) {
    const bodyFormData = new FormData();
    bodyFormData.append('contact-id', contact_uuid);
    bodyFormData.append('label', label);
    bodyFormData.append('public', 'false');
    bodyFormData.append('file', file.buffer, file.originalname);

    const headersRequest = {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    };
    try {
      const result = await lastValueFrom(
        this.httpService.post('https://sandbox.primetrust.com/v2/uploaded-documents', bodyFormData, {
          headers: headersRequest,
          ...bodyFormData.getHeaders(),
        }),
      );

      return result.data;
    } catch (e) {
      console.log(e.response.data);
    }
  }

  async saveDocument(documentData, contact_id, documentCheckResponse) {
    try {
      await this.primeTrustKycDocumentEntityRepository.save(
        this.primeTrustKycDocumentEntityRepository.create({
          contact_id,
          uuid: documentData.id,
          file_url: documentData.attributes['file-url'],
          extension: documentData.attributes['extension'],
          label: documentData.attributes['label'],
          kyc_check_uuid: documentCheckResponse.id,
          status: documentCheckResponse.attributes.status,
        }),
      );
    } catch (e) {
      console.log(e);
    }

    return { success: true };
  }
}
