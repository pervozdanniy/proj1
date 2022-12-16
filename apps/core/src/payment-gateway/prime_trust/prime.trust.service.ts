import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, map } from 'rxjs';
import { CreateRequestDto } from '~svc/core/src/user/dto/create.request.dto';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PrimeTrustUserEntity } from '~svc/core/src/user/entities/prime.trust.user.entity';

@Injectable()
export class PrimeTrustService {
  constructor(
    private readonly httpService: HttpService,
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

    const { data } = await lastValueFrom(
      this.httpService.post('https://sandbox.primetrust.com/v2/users', createData).pipe(
        catchError((e) => {
          console.log(e.response.data);

          throw new GrpcException(400, e.response.data, e.response.status);
        }),
      ),
    );

    if (data) {
      await this.primeUserRepository.save({
        ...user,
        uuid: data.data.id,
        status: 'active',
        disabled: data.data.attributes.disabled,
      });
    }
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
