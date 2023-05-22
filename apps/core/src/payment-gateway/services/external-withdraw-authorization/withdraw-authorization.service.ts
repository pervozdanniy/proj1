import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  AuthorizationWebhookRequest,
  AutorizationWebhookResponse,
} from '../../modules/inswitch/interfaces/webhook.interface';
import { InswitchService } from '../../modules/inswitch/services/inswitch.service';
import { KoyweMainManager } from '../koywe/managers/koywe-main.manager';
import { PrimeBalanceManager } from '../prime_trust/managers/prime-balance.manager';
// import { PrimeTrustService } from '../prime_trust/prime-trust.service';

@Injectable()
export class WithdrawAuthorizationService {
  private readonly logger = new Logger(WithdrawAuthorizationService.name);
  constructor(
    private readonly inswitch: InswitchService,
    private readonly koywe: KoyweMainManager,
    // private readonly primeWithdraw: PrimeTrustService,
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
    // TODO: replace with inswitch's exchange
    const { amountIn } = await this.koywe.getQuoteFromUsd(withdraw.amount, withdraw.currency);

    if (settled > amountIn) {
      return this.inswitch.approve(payload);
    }

    return this.inswitch.decline(payload);
  }

  async update(payload: AuthorizationWebhookRequest) {
    return this.inswitch.updateWithdraw(payload);
  }

  async payApproved() {
    const approved = this.inswitch.getApproved();
    for await (const pair of approved) {
      console.log('SSS', pair);
      // await this.primeWithdraw.makeAssetWithdrawal({
      //   id: pair.user_id,
      //   amount: pair.amount,
      //   wallet: this.inswitch.wallet,
      // });
    }
  }
}
