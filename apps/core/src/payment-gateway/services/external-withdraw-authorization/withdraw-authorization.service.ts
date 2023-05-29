import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConcurrencyBarrier } from '~common/utils/helpers/async';
import {
  AuthorizationWebhookRequest,
  AutorizationWebhookResponse,
} from '../../modules/inswitch/interfaces/webhook.interface';
import { InswitchService } from '../../modules/inswitch/services/inswitch.service';
import { PrimeBalanceManager } from '../prime_trust/managers/prime-balance.manager';
import { PrimeTrustService } from '../prime_trust/prime-trust.service';

@Injectable()
export class WithdrawAuthorizationService {
  private readonly logger = new Logger(WithdrawAuthorizationService.name);
  constructor(
    private readonly inswitch: InswitchService,
    private readonly primeWithdraw: PrimeTrustService,
    private readonly balance: PrimeBalanceManager,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    return;
    try {
      await this.payApproved();
    } catch (error) {
      this.logger.error('Pay inswitch failed', error.message, { error });
    }
  }

  async authorize(payload: AuthorizationWebhookRequest): Promise<AutorizationWebhookResponse> {
    const { withdraw, user } = await this.inswitch.parseWithdrawRequest(payload);
    const { settled } = await this.balance.getAccountBalance(user.id);

    // convert to BigInts and compare with high precision
    const usdAmount = (BigInt(withdraw.amount * 1e4) * BigInt(1e6)) / BigInt(withdraw.rate * 1e4);
    if (BigInt(settled * 1e6) > usdAmount) {
      return this.inswitch.approve(payload);
    }

    return this.inswitch.decline(payload);
  }

  async update(payload: AuthorizationWebhookRequest) {
    return this.inswitch.updateWithdraw(payload);
  }

  async payApproved() {
    const iterator = await this.inswitch.startProcessing();
    const barrier = new ConcurrencyBarrier(100);

    for await (const { user_id, amount } of iterator) {
      await barrier.wait();
      this.primeWithdraw
        .makeAssetWithdrawal({
          id: user_id,
          amount: Number.parseFloat(amount),
          wallet: this.inswitch.wallet,
        })
        .catch((error) => this.logger.error('Asset withdraw failed', error))
        .finally(() => barrier.release());
    }

    await barrier.finish();
    await this.inswitch.finishProcessing();
  }
}
