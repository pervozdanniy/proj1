import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PrimeTrustUserEntity } from '~svc/core/src/user/entities/prime-trust-user.entity';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { PrimeTrustStatus } from '~svc/core/src/payment-gateway/constants/prime-trust.status';
import { InjectRepository } from '@nestjs/typeorm';
import { PrimeTrustAccountEntity } from '~svc/core/src/user/entities/prime-trust-account.entity';
import { SuccessResponse } from '~common/grpc/interfaces/prime_trust';
import { generatePassword } from '~common/helpers';

@Injectable()
export class PrimeTrustService {
  private readonly logger = new Logger(PrimeTrustService.name);
  constructor(
    private readonly httpService: HttpService,

    @InjectRepository(PrimeTrustUserEntity)
    private readonly primeUserRepository: Repository<PrimeTrustUserEntity>,

    @InjectRepository(PrimeTrustAccountEntity)
    private readonly primeAccountRepository: Repository<PrimeTrustAccountEntity>,
  ) {}

  async createPendingPrimeUser(password: string, user_id: number) {
    const user = await this.primeUserRepository.save(
      this.primeUserRepository.create({
        user_id,
        password,
        disabled: true,
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
          status: PrimeTrustStatus.PENDING,
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

  async getAccountData(userDetails, token) {
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

      return openResponse.data;
    } catch (e) {
      this.logger.error(e.response.data.errors);

      throw new GrpcException(Status.ABORTED, e.response.data, 400);
    }
  }

  async createAccount(accountData, user_id): Promise<SuccessResponse> {
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

  // async uploadDocumentKYC(file) {
  //   const bodyFormData = new FormData();
  //   bodyFormData.append('contact-id', 'a09de1db-9db0-4449-a84e-faa3fb61b2c5');
  //   bodyFormData.append('label', 'drivers_license');
  //   bodyFormData.append('public', 'false');
  //   bodyFormData.append('file', file.buffer, file.originalname);
  //
  //   const http = new HttpService();
  //   const headersRequest = {
  //     Authorization: `Bearer eyJhbGciOiJSUzI1NiJ9.eyJhdXRoX3NlY3JldCI6ImU0MWNlNmE4LWQ5ODQtNDI1YS1iMGZlLWZhMjUwYzBiZTRkYyIsInVzZXJfZ3JvdXBzIjpbXSwibm93IjoxNjcxNDI3NzM1LCJleHAiOjE2NzIwMzI1MzV9.adsykzsxlePsje8Zm0BBwjA86NP5jJTAd3h6x2rB9_KESunk4AtK1AxfNqj7JWyaGRFuGtcTtJI8E-NEb4Db2D4rijVuN9khn6-ytwE-FKJ47yWN_glj2ziCgQturxY__ZOe9BWammgRJjLcDDhbmApvN6uN_rlb_faM9iV8g-YN5GmF-adpcKvpAK2ujOvSKpIsoZcKvroHcqDb9D7uyVJFjixmMRpXObUkS34Pze-_aDJDyTqEf-ZKSBVpxwKUgea8pBuHUhEIjZrvdpRJIOXFz7bonMCUXersKT3xFHwl9RjYs3bjg97kNd7cDuvwqTFRIbZBker2PflEm6ixoQ`,
  //   };
  //
  //   const result = await lastValueFrom(
  //     http.post('https://sandbox.primetrust.com/v2/uploaded-documents', bodyFormData, {
  //       headers: headersRequest,
  //     }),
  //   )
  //     .then((data) => {
  //       console.log(data);
  //     })
  //     .catch((e) => {
  //       console.log(e);
  //     });
  // }
}
