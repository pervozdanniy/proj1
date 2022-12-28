import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { PrimeTrustService } from '~svc/core/src/payment-gateway/prime_trust/prime-trust.service';
import { PrimeTrustUserEntity } from '~svc/core/src/user/entities/prime-trust-user.entity';

@Injectable()
export class PaymentGatewayCron {
  private readonly logger = new Logger(PaymentGatewayCron.name);
  constructor(
    private readonly httpService: HttpService,

    @InjectRepository(PrimeTrustUserEntity)
    private readonly primeUserRepository: Repository<PrimeTrustUserEntity>,

    @Inject(PrimeTrustService)
    private readonly primeTrustService: PrimeTrustService,
  ) {}

  @Cron(CronExpression.EVERY_2_HOURS)
  async handleCron() {
    const failedUsers = await this.primeUserRepository.find({
      where: { status: Not('active') },
      take: 100,
    });
    failedUsers.map(async (user) => {
      try {
        await this.primeTrustService.createUser(user);
      } catch (e) {
        this.logger.error(e.response.data);
      }
    });
  }
}
