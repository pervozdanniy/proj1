import { Injectable } from '@nestjs/common';
import { LiquidoWebhookRequest, TransferMethodRequest } from '~common/grpc/interfaces/payment-gateway';
import { LiquidoWebhookManager } from './managers/liquido-webhook.manager';
import { LiquidoWithdrawalManager } from './managers/liquido-withdrawal.manager';

@Injectable()
export class LiquidoService {
  constructor(
    private readonly liquidoWithdrawalManager: LiquidoWithdrawalManager,
    private readonly liquidoWebhookManager: LiquidoWebhookManager,
  ) {}

  makeWithdrawal(request: TransferMethodRequest) {
    return this.liquidoWithdrawalManager.makeWithdrawal(request);
  }

  liquidoWebhooksHandler(request: LiquidoWebhookRequest) {
    return this.liquidoWebhookManager.liquidoWebhooksHandler(request);
  }
}
