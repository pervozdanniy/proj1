import { UserService } from '@/user/services/user.service';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { TransferInfo, TransferMethodRequest } from '~common/grpc/interfaces/payment-gateway';
import {
  LiquidoAuthorizationStatus,
  LiquidoWithdrawAuthorizationEntity,
} from '../../../entities/liquido_withdraw_authorization.entity';
import { PrimeAccountManager } from '../../prime_trust/managers/prime-account.manager';
import { PrimeAssetsManager } from '../../prime_trust/managers/prime-assets.manager';
import { BrazilPayoutService } from '../payouts/brazil-payout.service';
import { ChilePayoutService } from '../payouts/chile-payout.service';
import { MexicoPayoutService } from '../payouts/mexico-payout.service';

@Injectable()
export class LiquidoWithdrawalManager {
  private readonly logger = new Logger(LiquidoWithdrawalManager.name);
  private readonly skopaKoyweAccountId: string;
  private readonly koyweLiquidoWallet: string;
  constructor(
    config: ConfigService<ConfigInterface>,
    private readonly userService: UserService,
    private readonly mexicoPayoutService: MexicoPayoutService,
    private readonly brazilPayoutService: BrazilPayoutService,
    private readonly chilePayoutService: ChilePayoutService,
    private readonly primeAccountManager: PrimeAccountManager,
    private readonly primeAssetsManager: PrimeAssetsManager,

    @InjectRepository(LiquidoWithdrawAuthorizationEntity)
    private readonly liquidoAuthRepo: Repository<LiquidoWithdrawAuthorizationEntity>,
  ) {
    const { skopaKoyweAccountId, koyweLiquidoWallet } = config.get('prime_trust', { infer: true });
    this.skopaKoyweAccountId = skopaKoyweAccountId;
    this.koyweLiquidoWallet = koyweLiquidoWallet;
  }

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async handleCron() {
    const { amount } = await this.getWithdrawalSumAmount();
    if (amount) {
      const { user_id: sender_id } = await this.primeAccountManager.getAccountByUuid(this.skopaKoyweAccountId);
      try {
        await this.primeAssetsManager.makeAssetWithdrawal({
          id: sender_id,
          amount,
          wallet: this.koyweLiquidoWallet,
        });
        await this.updateToProcessed();
      } catch (e) {
        this.logger.error('Liquido send money cron error!');
      }
    }
  }

  async makeWithdrawal(request: TransferMethodRequest): Promise<TransferInfo> {
    const userDetails = await this.userService.getUserInfo(request.id);
    switch (userDetails.country_code) {
      case 'MX':
        return this.mexicoPayoutService.makePayout(request);
      case 'BR':
        return this.brazilPayoutService.makePayout(request);
      case 'CL':
        return this.chilePayoutService.makePayout(request);
    }
  }

  async getWithdrawalSumAmount(): Promise<{ amount: number }> {
    await this.liquidoAuthRepo.update(
      { status: LiquidoAuthorizationStatus.Pending },
      { status: LiquidoAuthorizationStatus.Processing },
    );

    return this.liquidoAuthRepo
      .createQueryBuilder('w')
      .select('SUM(w.amount_usd)', 'amount')
      .where('w.status != :status', { status: LiquidoAuthorizationStatus.Processed })
      .getRawOne();
  }

  async updateToProcessed() {
    await this.liquidoAuthRepo.update(
      { status: LiquidoAuthorizationStatus.Processing },
      { status: LiquidoAuthorizationStatus.Processed },
    );
  }
}
