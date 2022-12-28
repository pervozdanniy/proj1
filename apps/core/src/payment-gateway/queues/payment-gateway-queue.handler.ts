import { HttpService } from '@nestjs/axios';
import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { PrimeTrustStatus } from '~svc/core/src/payment-gateway/constants/prime-trust.status';
import { PrimeTrustUserEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-user.entity';
import { PrimeTrustService } from '~svc/core/src/payment-gateway/services/prime_trust/prime-trust.service';

@Injectable()
@Processor('users_registration')
export class PaymentGatewayQueueHandler {
  private readonly logger = new Logger(PaymentGatewayQueueHandler.name);

  private readonly prime_trust_url: string;
  constructor(
    private readonly httpService: HttpService,

    @InjectRepository(PrimeTrustUserEntity)
    private readonly primeUserRepository: Repository<PrimeTrustUserEntity>,

    @Inject(PrimeTrustService)
    private readonly primeTrustService: PrimeTrustService,

    private config: ConfigService<ConfigInterface>,
  ) {
    const { prime_trust_url } = config.get('app');
    this.prime_trust_url = prime_trust_url;
  }

  @Process('registration')
  async handleFailedRegistrations(job: Job) {
    const { user_id } = job.data;
    const failedUser = await this.primeUserRepository.findOne({
      where: { user_id },
      relations: ['skopa_user'],
    });

    const createData = {
      data: {
        type: 'user',
        attributes: {
          email: failedUser.skopa_user.email,
          name: failedUser.skopa_user.username,
          password: failedUser.password,
        },
      },
    };
    let response;
    try {
      response = await lastValueFrom(this.httpService.post(`${this.prime_trust_url}/v2/users`, createData));
    } catch (e) {
      this.logger.error(e.response.data);

      throw new Error(e.response.data);
    }

    await this.primeUserRepository.save({
      ...failedUser,
      uuid: response.data.data.id,
      status: PrimeTrustStatus.ACTIVE,
      disabled: response.data.data.attributes.disabled,
    });
  }

  @OnQueueFailed({ name: 'registration' })
  async test(job: Job, err: Error) {
    if (job.opts.attempts === job.attemptsMade) {
      const { user_id } = job.data;
      await this.primeUserRepository.update({ user_id }, { status: 'failed' });
    }
    if (err) {
      this.logger.error(err);
    }
  }
}
