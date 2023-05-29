import { UserService } from '@/user/services/user.service';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { Providers } from '~common/enum/providers';
import { TransferInfo, TransferMethodRequest } from '~common/grpc/interfaces/payment-gateway';
import { TransfersEntity, TransferStatus, TransferTypes } from '../../../entities/transfers.entity';
import { PrimeAccountManager } from '../../prime_trust/managers/prime-account.manager';
import { PrimeAssetsManager } from '../../prime_trust/managers/prime-assets.manager';
import { BrazilPayoutService } from '../payouts/brazil-payout.service';
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
    private readonly primeAccountManager: PrimeAccountManager,
    private readonly primeAssetsManager: PrimeAssetsManager,
    @InjectRepository(TransfersEntity)
    private readonly transferRepository: Repository<TransfersEntity>,
  ) {
    const { skopaKoyweAccountId, koyweLiquidoWallet } = config.get('prime_trust', { infer: true });
    this.skopaKoyweAccountId = skopaKoyweAccountId;
    this.koyweLiquidoWallet = koyweLiquidoWallet;
  }

  @Cron('* * */10 * * *')
  async handleCron() {
    const settledWithdrawals = await this.transferRepository
      .createQueryBuilder()
      .select()
      .where('status = :status', { status: TransferStatus.SETTLED })
      .andWhere('provider = :provider', { provider: Providers.LIQUIDO })
      .andWhere('type = :type', { type: TransferTypes.WITHDRAWAL })
      .getMany();
    if (settledWithdrawals.length > 0) {
      const { user_id: sender_id } = await this.primeAccountManager.getAccountByUuid(this.skopaKoyweAccountId);
      const sumOfAmount = settledWithdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount_usd, 0);
      await this.primeAssetsManager.makeAssetWithdrawal({
        id: sender_id,
        amount: sumOfAmount,
        wallet: this.koyweLiquidoWallet,
      });
      await this.transferRepository
        .createQueryBuilder()
        .update()
        .set({ status: TransferStatus.EXECUTED })
        .where('status = :status', { status: TransferStatus.SETTLED })
        .andWhere('provider = :provider', { provider: Providers.LIQUIDO })
        .andWhere('type = :type', { type: TransferTypes.WITHDRAWAL })
        .execute();
    } else {
      this.logger.log('All liquido withdrawals money sent to koywe!');
    }
  }

  async makeWithdrawal(request: TransferMethodRequest): Promise<TransferInfo> {
    const userDetails = await this.userService.getUserInfo(request.id);
    switch (userDetails.country_code) {
      case 'MX':
        return this.mexicoPayoutService.makePayout(request);
      case 'BR':
        return this.brazilPayoutService.makePayout(request);
    }
  }
}
