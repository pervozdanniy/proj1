import { Injectable } from '@nestjs/common';
import { FacilitaWebhookRequest } from '~common/grpc/interfaces/payment-gateway';
import { CreateReferenceRequest } from '../../interfaces/payment-gateway.interface';
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

  createWireReference(request: CreateReferenceRequest) {
    return this.facilitaDepositManager.createWireReference(request);
  }
}
