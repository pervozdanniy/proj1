import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { PrimeTrustUserEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-user.entity';
import { Not, Repository } from 'typeorm';
import { PrimeTrustService } from '~svc/core/src/payment-gateway/services/prime_trust/prime-trust.service';

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
