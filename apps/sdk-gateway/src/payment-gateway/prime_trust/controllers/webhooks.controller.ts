import { KoyweWebhookType } from '@/payment-gateway/prime_trust/webhooks/data';
import { Body, ClassSerializerInterceptor, Controller, Logger, Post, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentGatewayService } from '../services/payment-gateway.service';
import { PrimeTrustWebhookType, webhookData } from '../webhooks/data';

@ApiTags('Webhooks')
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: 'webhook',
})
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);
  constructor(private paymentGatewayService: PaymentGatewayService) {}
  @Post('/prime_trust')
  async webhook(@Body() payload: PrimeTrustWebhookType) {
    this.logger.log(payload);
    const {
      resource_type,
      action,
      data: { changes },
    } = payload;

    const sendData = {
      id: payload['account-id'],
      resource_id: payload['resource_id'],
    };

    if (resource_type === 'accounts' && action === 'update') {
      return this.paymentGatewayService.updateAccount(sendData);
    }
    if ((resource_type === 'contacts' || resource_type === 'contact') && action === 'update') {
      return this.paymentGatewayService.updateContact(sendData);
    }
    if (resource_type === 'sub_asset_transfers' && action === 'update') {
      return this.paymentGatewayService.updateBalance(sendData);
    }
    if (resource_type === 'internal_asset_transfers' && action === 'update') {
      return this.paymentGatewayService.updateBalance(sendData);
    }
    if (resource_type === 'kyc_document_checks' && (action === 'update' || action === 'create')) {
      return this.paymentGatewayService.documentCheck(sendData);
    }
    if (resource_type === 'cip_checks' && (action === 'update' || action === 'create')) {
      return this.paymentGatewayService.cipCheck(sendData);
    }
    if (resource_type === 'contributions' && action === 'update') {
      const paramsToCheck = ['amount', 'payment-details', 'status'];

      const allParamsExist = paramsToCheck.every((param) => changes.includes(param));
      if (allParamsExist) {
        return this.paymentGatewayService.updateContribution(sendData);
      }
    }
    if (resource_type === 'funds_transfers' && action === 'update') {
      return this.paymentGatewayService.updateBalance(sendData);
    }
    if (resource_type === 'disbursements' && action === 'update') {
      return this.paymentGatewayService.updateWithdraw(sendData);
    }
    if (resource_type === 'asset_transfers' && action === 'update') {
      const paramsToCheck = ['status', 'unit-count', 'from-wallet-address'];

      const allParamsExist = paramsToCheck.every((param) => changes.includes(param));
      if (allParamsExist) {
        return this.paymentGatewayService.updateAssetDeposit(sendData);
      }
    }

    const match = webhookData.find((e) => e === resource_type);
    if (!match) {
      this.logger.error(`Webhook ${resource_type} not found!`);
    }
  }

  @Post('/koywe')
  async koyweHandler(@Body() payload: KoyweWebhookType) {
    this.logger.log(payload);

    return this.paymentGatewayService.koyweWebhooksHandler(payload);
  }
}
