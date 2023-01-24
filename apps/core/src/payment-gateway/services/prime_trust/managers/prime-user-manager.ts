import { HttpService } from '@nestjs/axios';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';
import { ConfigInterface } from '~common/config/configuration';

@Injectable()
export class PrimeUserManager {
  private readonly prime_trust_url: string;
  constructor(
    private config: ConfigService<ConfigInterface>,
    private readonly httpService: HttpService,

    @InjectQueue('users_registration') private usersRegistrationQueue: Queue,
  ) {
    const { prime_trust_url } = config.get('app');
    this.prime_trust_url = prime_trust_url;
  }
}
