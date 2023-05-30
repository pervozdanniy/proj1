import { Injectable } from '@nestjs/common';
import {
  LiquidoDepositWebhookRequest,
  LiquidoWithdrawalWebhookRequest,
  TransferMethodRequest,
} from '~common/grpc/interfaces/payment-gateway';
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

  liquidoDepositHandler(request: LiquidoDepositWebhookRequest) {
    return this.liquidoWebhookManager.liquidoDepositHandler(request);
  }

  createCashPayment(request: CreateReferenceRequest) {
    return this.liquidoDepositManager.createCashPayment(request);
  }

  makeWithdrawal(request: TransferMethodRequest) {
    return this.liquidoWithdrawalManager.makeWithdrawal(request);
  }

  liquidoWithdrawHandler(request: LiquidoWithdrawalWebhookRequest) {
    return this.liquidoWebhookManager.liquidoWithdrawHandler(request);
  }
}
