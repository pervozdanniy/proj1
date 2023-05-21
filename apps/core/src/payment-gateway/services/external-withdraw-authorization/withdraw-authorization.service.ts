import { Injectable } from '@nestjs/common';
import {
  AuthorizationWebhookRequest,
  AutorizationWebhookResponse,
} from '../../modules/inswitch/interfaces/webhook.interface';
import { InswitchService } from '../../modules/inswitch/services/inswitch.service';
import { KoyweMainManager } from '../koywe/managers/koywe-main.manager';
import { PrimeBalanceManager } from '../prime_trust/managers/prime-balance.manager';

@Injectable()
export class WithdrawAuthorizationService {
  constructor(
    private readonly inswitch: InswitchService,
    private readonly koywe: KoyweMainManager,
    private readonly balance: PrimeBalanceManager,
  ) {}

  async authorize(payload: AuthorizationWebhookRequest): Promise<AutorizationWebhookResponse> {
    const { withdraw, user } = await this.inswitch.parseWithdrawRequest(payload);
    const { settled } = await this.balance.getAccountBalance(user.id);
    const { amountIn } = await this.koywe.getQuoteFromUsd(withdraw.amount, withdraw.currency);

    if (settled > amountIn) {
      return this.inswitch.approve(payload);
    }

    return this.inswitch.decline(payload);
  }

  async update(payload: AuthorizationWebhookRequest) {
    return this.inswitch.updateWithdraw(payload);
  }
}
