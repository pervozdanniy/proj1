import { Status } from '@grpc/grpc-js/build/src/constants';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { generatePassword } from '~common/helpers';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { PrimeTrustStatus } from '~svc/core/src/payment-gateway/constants/prime-trust.status';
import { PrimeTrustUserEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-user.entity';

@Injectable()
export class PrimeUserManager {
  private readonly logger = new Logger(PrimeUserManager.name);
  private readonly prime_trust_url: string;
  constructor(
    private config: ConfigService<ConfigInterface>,
    private readonly httpService: HttpService,
    @InjectRepository(PrimeTrustUserEntity)
    private readonly primeUserRepository: Repository<PrimeTrustUserEntity>,
  ) {
    const { prime_trust_url } = config.get('app');
    this.prime_trust_url = prime_trust_url;
  }

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
      response = await lastValueFrom(this.httpService.post(`${this.prime_trust_url}/v2/users`, createData));
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
}
