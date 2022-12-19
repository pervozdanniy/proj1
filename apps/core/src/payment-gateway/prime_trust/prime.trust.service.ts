import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PrimeTrustUserEntity } from '~svc/core/src/user/entities/prime.trust.user.entity';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { PrimeTrustStatus } from '~svc/core/src/payment-gateway/constants/prime.trust.status';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PrimeTrustService {
  constructor(
    private readonly httpService: HttpService,

    @InjectRepository(PrimeTrustUserEntity)
    private readonly primeUserRepository: Repository<PrimeTrustUserEntity>,
  ) {}

  async createUserInDB({ email, name, password, user_id }) {
    const user = await this.primeUserRepository.save(
      this.primeUserRepository.create({
        email,
        name,
        user_id,
        password,
        disabled: true,
        status: PrimeTrustStatus.PENDING,
      }),
    );

    return user;
  }

  async createUser(user) {
    const createData = {
      data: {
        type: 'user',
        attributes: {
          email: user.email,
          name: user.name,
          password: user.password,
        },
      },
    };
    let response;

    try {
      response = await lastValueFrom(this.httpService.post('https://sandbox.primetrust.com/v2/users', createData));
    } catch (e) {
      throw new GrpcException(Status.ABORTED, e.response.data, 400);
    }

    await this.primeUserRepository.save({
      ...user,
      uuid: response.data.data.id,
      status: PrimeTrustStatus.ACTIVE,
      disabled: response.data.data.attributes.disabled,
    });
  }

  async getToken(email) {
    const user = await this.primeUserRepository.findOne({ where: { email } });

    if (!user) {
      throw new GrpcException(Status.NOT_FOUND, 'Payment Gateway user not found!', 204);
    }
    const headersRequest = {
      'Content-Type': 'application/json', // afaik this one is not needed
      Authorization: `Basic ${Buffer.from(`${user.email}:${user.password}`).toString('base64')}`,
    };

    const result = await lastValueFrom(
      this.httpService.post('https://sandbox.primetrust.com/auth/jwts', {}, { headers: headersRequest }),
    );

    return result.data;
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
