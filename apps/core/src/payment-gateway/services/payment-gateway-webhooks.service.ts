import { Injectable, Logger } from '@nestjs/common';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import {
  FacilitaWebhookRequest,
  KoyweWebhookRequest,
  LinkWebhookRequest,
  LiquidoWebhookRequest,
  PrimeWebhookRequest,
} from '~common/grpc/interfaces/payment-gateway';
import { webhookData } from '../types/prime-trust';
import { FacilitaService } from './facilita/facilita.service';
import { KoyweService } from './koywe/koywe.service';
import { LiquidoService } from './liquido/liquido.service';
import { PrimeLinkManager } from './prime_trust/managers/prime-link-manager';
import { PrimeTrustService } from './prime_trust/prime-trust.service';

@Injectable()
export class PaymentGatewayWebhooksService {
  private readonly logger = new Logger(PaymentGatewayWebhooksService.name);
  constructor(
    private primeTrustService: PrimeTrustService,
    private koyweService: KoyweService,
    private facilitaService: FacilitaService,
    private primeLinkManager: PrimeLinkManager,
    private liquidoService: LiquidoService,
  ) {}

  koyweWebhooksHandler(request: KoyweWebhookRequest) {
    return this.koyweService.koyweWebhooksHandler(request);
  }

  facilitaWebhooksHandler(request: FacilitaWebhookRequest) {
    return this.facilitaService.facilitaWebhooksHandler(request);
  }

  liquidoWebhooksHandler(request: LiquidoWebhookRequest) {
    return this.liquidoService.liquidoWebhooksHandler(request);
  }

  linkWebhookHandler(request: LinkWebhookRequest) {
    return this.primeLinkManager.linkWebhookHandler(request);
  }

  async primeWebhooksHandler(payload: PrimeWebhookRequest): Promise<SuccessResponse> {
    const {
      resource_type,
      action,
      data: { changes },
    } = payload;

    const sendData = {
      id: payload['account_id'],
      resource_id: payload['resource_id'],
    };

    if (resource_type === 'accounts' && action === 'update') {
      return this.primeTrustService.updateAccount(sendData);
    }
    if ((resource_type === 'contacts' || resource_type === 'contact') && action === 'update') {
      return this.primeTrustService.updateContact(sendData);
    }
    if (resource_type === 'sub_asset_transfers' && action === 'update') {
      return this.primeTrustService.updateBalance(sendData);
    }
    if (resource_type === 'internal_asset_transfers' && action === 'update') {
      return this.primeTrustService.updateBalance(sendData);
    }
    if (resource_type === 'kyc_document_checks' && (action === 'update' || action === 'create')) {
      return this.primeTrustService.documentCheck(sendData);
    }
    if (resource_type === 'cip_checks' && (action === 'update' || action === 'create')) {
      return this.primeTrustService.cipCheck(sendData);
    }
    if (resource_type === 'contributions' && action === 'update') {
      const paramsToCheck = ['amount', 'payment-details', 'status'];

      const allParamsExist = paramsToCheck.every((param) => changes.includes(param));
      if (allParamsExist) {
        return this.primeTrustService.updateContribution(sendData);
      }
    }
    if (resource_type === 'contingent_holds' && action === 'update') {
      return this.primeTrustService.contingentHolds(sendData);
    }
    if (resource_type === 'funds_transfers' && action === 'update') {
      return this.primeTrustService.updateFundsTransfer(sendData);
    }

    if (resource_type === 'disbursements' && action === 'update') {
      return this.primeTrustService.updateWithdraw(sendData);
    }
    if (resource_type === 'asset_transfers' && action === 'update') {
      const paramsToCheck = 'contingencies-cleared-on';

      if (changes[0] === paramsToCheck) {
        return this.primeTrustService.updateAssetDeposit(sendData);
      }
    }

    const match = webhookData.find((e) => e === resource_type);
    if (!match) {
      this.logger.error(`Webhook ${resource_type} not found!`);
    } else {
      return { success: true };
    }
  }
}
