import { Injectable } from '@nestjs/common';
import { LiquidoWebhookRequest, TransferMethodRequest } from '~common/grpc/interfaces/payment-gateway';
import { CreateReferenceRequest } from '../../interfaces/payment-gateway.interface';
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

  liquidoWebhooksHandler(request: LiquidoWebhookRequest) {
    return this.liquidoWebhookManager.liquidoWebhooksHandler(request);
  }

  createCashPayment(request: CreateReferenceRequest) {
    return this.liquidoDepositManager.createCashPayment(request);
  }

  makeWithdrawal(request: TransferMethodRequest) {
    return this.liquidoWithdrawalManager.makeWithdrawal(request);
  }
}
