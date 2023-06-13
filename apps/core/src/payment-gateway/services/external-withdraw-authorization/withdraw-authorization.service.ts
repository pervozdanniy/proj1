import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import Fraction from 'fraction.js';
import { Repository } from 'typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { TransfersEntity, TransferStatus, TransferTypes } from '../../entities/transfers.entity';
import { FeeService } from '../../modules/fee/fee.service';
import {
  AuthorizationWebhookRequest,
  AutorizationWebhookResponse,
} from '../../modules/inswitch/interfaces/webhook.interface';
import { InswitchService } from '../../modules/inswitch/services/inswitch.service';
import { PrimeBalanceManager } from '../prime_trust/managers/prime-balance.manager';
import { PrimeTrustService } from '../prime_trust/prime-trust.service';
import { PrimeTrustClient } from './prime-trust.client';

@Injectable()
export class WithdrawAuthorizationService {
  private readonly inswitchAccountId: string;
  private readonly feeAccountId: string;
  private readonly logger = new Logger(WithdrawAuthorizationService.name);

  constructor(
    config: ConfigService<ConfigInterface>,
    private readonly inswitch: InswitchService,
    private readonly primeTrust: PrimeTrustService,
    private readonly balance: PrimeBalanceManager,
    private readonly primeTrustClient: PrimeTrustClient,
    @InjectRepository(TransfersEntity) private readonly transfersRepo: Repository<TransfersEntity>,
    private readonly feeService: FeeService,
  ) {
    const { feeAccountId, inswitchAccountId } = config.get('prime_trust', { infer: true });
    this.feeAccountId = feeAccountId;
    this.inswitchAccountId = inswitchAccountId;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    try {
      await this.payApproved();
    } catch (error) {
      this.logger.error('Pay inswitch failed', error.message, { error });
    }
  }

  async authorize(payload: AuthorizationWebhookRequest): Promise<AutorizationWebhookResponse> {
    try {
      const { withdraw, user } = await this.inswitch.parseWithdrawRequest(payload);
      const { settled, hot_balance, cold_balance } = await this.balance.getAccountBalance(user.id);

      const usdAmount = new Fraction(withdraw.amount).div(withdraw.rate);
      const { total, fee } = await this.feeService.calculate(usdAmount, user.country_code);
      if (total.compare(settled) < 0) {
        const amount = total.round(6).valueOf();
        const account = await this.primeTrust.getAccount(user.id);
        const hotStatus = cold_balance < amount && hot_balance > amount;
        await this.primeTrustClient.assetTransfer(account.uuid, this.inswitchAccountId, amount, hotStatus);

        return this.inswitch.approve(payload, { user: usdAmount, fee });
      }
    } catch (error) {
      this.logger.error('Authorization request failed', error.message, { payload, error });

      return this.inswitch.decline(payload);
    }

    return this.inswitch.decline(payload);
  }

  async update(payload: AuthorizationWebhookRequest) {
    try {
      const { withdraw, user } = await this.inswitch.parseWithdrawRequest(payload);
      const { approved, amount } = await this.inswitch.updateWithdraw(payload);
      const usdAmount = new Fraction(withdraw.amount).div(withdraw.rate);
      const { fee } = await this.feeService.calculate(usdAmount, user.country_code);
      const account = await this.primeTrust.getAccount(user.id);
      if (approved) {
        await this.transfersRepo.save(
          this.transfersRepo.create({
            user_id: user.id,
            type: TransferTypes.WITHDRAWAL,
            status: TransferStatus.SETTLED,
            amount: Number.parseFloat(amount),
            amount_usd: usdAmount.valueOf(),
            currency_type: withdraw.currency,
            fee: fee.valueOf(),
            internal_fee_usd: fee.valueOf(),
          }),
        );
        await this.primeTrust.updateBalance({ id: account.uuid });
      } else {
        await this.primeTrustClient.assetTransfer(
          this.inswitchAccountId,
          account.uuid,
          usdAmount.round(6).valueOf(),
          false,
        );
      }
    } catch (error) {
      this.logger.error('Update failed', error.message, { payload, error });
    }
  }

  async payApproved() {
    const { amount, fee } = await this.inswitch.startProcessing();
    const contact = await this.primeTrustClient.getAccountOwner(this.inswitchAccountId);

    await Promise.all([
      this.primeTrustClient.assetWidthdraw({
        contactId: contact.id,
        accountId: this.inswitchAccountId,
        amount: new Fraction(amount).round(6).valueOf(),
        wallet: this.inswitch.wallet,
        hot: false,
      }),
      this.primeTrustClient.assetTransfer(
        this.inswitchAccountId,
        this.feeAccountId,
        new Fraction(fee).round(6).valueOf(),
        false,
      ),
    ]);

    await this.inswitch.finishProcessing();
  }
}
