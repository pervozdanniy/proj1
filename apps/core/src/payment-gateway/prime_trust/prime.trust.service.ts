import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PrimeTrustUserEntity } from '~svc/core/src/user/entities/prime.trust.user.entity';
import { Queue } from 'bull';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { PrimeTrustStatus } from '~svc/core/src/payment-gateway/constants/prime.trust.status';

@Injectable()
export class PrimeTrustService {
  constructor(
    private readonly httpService: HttpService,
    private readonly primeUserRepository: Repository<PrimeTrustUserEntity>,
    private readonly failedRequestsQueue: Queue,
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

    await lastValueFrom(this.httpService.post('https://sandbox.primetrust.com/v2/users', createData))
      .then(async (response) => {
        await this.primeUserRepository.save({
          ...user,
          uuid: response.data.data.id,
          status: PrimeTrustStatus.ACTIVE,
          disabled: response.data.data.attributes.disabled,
        });
      })
      .catch(async (e) => {
        if (e.code == 'ENOTFOUND') {
          await this.failedRequestsQueue.add('no_connection_jobs', { ...user, payment_gateway: 'prime_trust' });
        } else {
          throw new GrpcException(Status.ABORTED, e.response.data, 400);
        }
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
}
