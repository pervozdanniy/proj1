import { Injectable } from '@nestjs/common';
import { CreateReferenceRequest, PayfuraWebhookRequest } from '~common/grpc/interfaces/payment-gateway';
import { PayfuraDepositManager } from './managers/payfura-deposit.manager';
import { PayfuraWebhookManager } from './managers/payfura-webhook.manager';

@Injectable()
export class PayfuraService {
  constructor(
    private readonly payfuraDepositManager: PayfuraDepositManager,
    private readonly payfuraWebhookManager: PayfuraWebhookManager,
  ) {}

  createReference(request: CreateReferenceRequest, wallet_address: string, asset_transfer_method_id: string) {
    return this.payfuraDepositManager.createReference(request, wallet_address, asset_transfer_method_id);
  }

  payfuraWebhooksHandler(request: PayfuraWebhookRequest) {
    return this.payfuraWebhookManager.payfuraWebhooksHandler(request);
  }
}
