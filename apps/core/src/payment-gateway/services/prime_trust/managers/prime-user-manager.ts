import { HttpService } from '@nestjs/axios';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { generatePassword } from '~common/helpers';
import { PrimeTrustStatus } from '~svc/core/src/payment-gateway/constants/prime-trust.status';
import { PrimeTrustUserEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-user.entity';

@Injectable()
export class PrimeUserManager {
  private readonly prime_trust_url: string;
  constructor(
    private config: ConfigService<ConfigInterface>,
    private readonly httpService: HttpService,
    @InjectRepository(PrimeTrustUserEntity)
    private readonly primeUserRepository: Repository<PrimeTrustUserEntity>,

    @InjectQueue('users_registration') private usersRegistrationQueue: Queue,
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
    await this.createPendingPrimeUser(pg_password, user.id);
    await this.usersRegistrationQueue.add('registration', { user_id: user.id });

    return true;
  }
}
