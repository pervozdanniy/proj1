import { Injectable } from '@nestjs/common';
import { FacilitaWebhookRequest } from '~common/grpc/interfaces/payment-gateway';
import { MakeDepositRequest } from '../../interfaces/payment-gateway.interface';
import { FacilitaDepositManager } from './managers/facilita-deposit.manager';
import { FacilitaWebhookManager } from './managers/facilita-webhook.manager';

@Injectable()
export class FacilitaService {
  constructor(
    private readonly facilitaDepositManager: FacilitaDepositManager,
    private readonly facilitaWebhookManager: FacilitaWebhookManager,
  ) {}

  facilitaWebhooksHandler(request: FacilitaWebhookRequest) {
    return this.facilitaWebhookManager.facilitaWebhooksHandler(request);
  }

  makeDeposit(request: MakeDepositRequest) {
    return this.facilitaDepositManager.makeDeposit(request);
  }
}
