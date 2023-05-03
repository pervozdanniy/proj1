import { Injectable } from '@nestjs/common';
import {
  AccountIdRequest,
  FacilitaWebhookRequest,
  KoyweWebhookRequest,
  LiquidoWebhookRequest,
} from '~common/grpc/interfaces/payment-gateway';
import { FacilitaService } from './facilita/facilita.service';
import { KoyweService } from './koywe/koywe.service';
import { LiquidoService } from './liquido/liquido.service';
import { PrimeTrustService } from './prime_trust/prime-trust.service';

@Injectable()
export class PaymentGatewayWebhooksService {
  constructor(
    private primeTrustService: PrimeTrustService,
    private koyweService: KoyweService,
    private facilitaService: FacilitaService,
    private liquidoService: LiquidoService,
  ) {}

  updateAccount(request: AccountIdRequest) {
    return this.primeTrustService.updateAccount(request.id);
  }

  updateContact(request: AccountIdRequest) {
    return this.primeTrustService.updateContact(request);
  }

  documentCheck(request: AccountIdRequest) {
    return this.primeTrustService.documentCheck(request);
  }

  cipCheck(request: AccountIdRequest) {
    const { id, resource_id } = request;

    return this.primeTrustService.cipCheck(id, resource_id);
  }

  updateBalance(request: AccountIdRequest) {
    return this.primeTrustService.updateAccountBalance(request.id);
  }

  updateWithdraw(request: AccountIdRequest) {
    return this.primeTrustService.updateWithdraw(request);
  }

  updateContribution(request: AccountIdRequest) {
    return this.primeTrustService.updateContribution(request);
  }

  updateAssetDeposit(request: AccountIdRequest) {
    return this.primeTrustService.updateAssetDeposit(request);
  }

  koyweWebhooksHandler(request: KoyweWebhookRequest) {
    return this.koyweService.koyweWebhooksHandler(request);
  }

  facilitaWebhooksHandler(request: FacilitaWebhookRequest) {
    return this.facilitaService.facilitaWebhooksHandler(request);
  }

  liquidoWebhooksHandler(request: LiquidoWebhookRequest) {
    return this.liquidoService.liquidoWebhooksHandler(request);
  }

  contingentHolds(request: AccountIdRequest) {
    return this.primeTrustService.contingentHolds(request);
  }
}
