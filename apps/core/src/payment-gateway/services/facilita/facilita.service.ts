import { Injectable } from '@nestjs/common';
import { MakeDepositRequest, PayfuraWebhookRequest } from '~common/grpc/interfaces/payment-gateway';
import { FacilitaDepositManager } from './managers/facilita-deposit.manager';
import { FacilitaWebhookManager } from './managers/facilita-webhook.manager';

@Injectable()
export class FacilitaService {
  constructor(
    private readonly facilitaDepositManager: FacilitaDepositManager,
    private readonly facilitaWebhookManager: FacilitaWebhookManager,
  ) {}

  payfuraWebhooksHandler(request: PayfuraWebhookRequest) {
    return this.facilitaWebhookManager.payfuraWebhooksHandler(request);
  }

  makeDeposit(request: MakeDepositRequest) {
    return this.facilitaDepositManager.makeDeposit(request);
  }
}
