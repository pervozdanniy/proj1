import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { CreateRequestDto } from '~svc/core/src/user/dto/create.request.dto';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PrimeTrustUserEntity } from '~svc/core/src/user/entities/prime.trust.user.entity';
import { Queue } from 'bull';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { Status } from '@grpc/grpc-js/build/src/constants';

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
        status: 'pending',
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
          status: 'active',
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

  async getToken(user: CreateRequestDto) {
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
