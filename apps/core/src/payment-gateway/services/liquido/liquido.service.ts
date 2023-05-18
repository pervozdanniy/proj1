import { Injectable } from '@nestjs/common';
import {
  CreateReferenceRequest,
  LiquidoWebhookRequest,
  TransferMethodRequest,
} from '~common/grpc/interfaces/payment-gateway';
import { LiquidoDepositManager } from './managers/liquido-deposit.manager';
import { LiquidoWebhookManager } from './managers/liquido-webhook.manager';
import { LiquidoWithdrawalManager } from './managers/liquido-withdrawal.manager';

@Injectable()
export class LiquidoService {
  constructor(
    private readonly liquidoWithdrawalManager: LiquidoWithdrawalManager,
    private readonly liquidoWebhookManager: LiquidoWebhookManager,

    private readonly liquidoDepositManager: LiquidoDepositManager,
  ) {}

  makeWithdrawal(request: TransferMethodRequest) {
    return this.liquidoWithdrawalManager.makeWithdrawal(request);
  }

  liquidoWebhooksHandler(request: LiquidoWebhookRequest) {
    return this.liquidoWebhookManager.liquidoWebhooksHandler(request);
  }

  createCashPayment(request: CreateReferenceRequest) {
    return this.liquidoDepositManager.createCashPayment(request);
  }
}
