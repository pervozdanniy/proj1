import { Body, ClassSerializerInterceptor, Controller, Logger, Post, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SdkPaymentGatewayService } from '../services/sdk-payment-gateway.service';
import { webhookData } from '../webhooks/data';

@ApiTags('SDK/Webhooks')
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: 'sdk/webhook',
})
export class SdkWebhooksController {
  private readonly logger = new Logger(SdkWebhooksController.name);
  constructor(private paymentGatewayService: SdkPaymentGatewayService) {}
  @Post('/prime_trust')
  async webhook(@Body() payload: any) {
    this.logger.log(payload);
    const {
      resource_type,
      action,
      data: { changes },
    } = payload;

    const sendData = {
      id: payload['account-id'],
      resource_id: payload['resource_id'],
      payment_gateway: 'prime_trust',
    };

    if (resource_type === 'accounts' && action === 'update') {
      return this.paymentGatewayService.updateAccount(sendData);
    }
    if (resource_type === 'kyc_document_checks' && action === 'update') {
      return this.paymentGatewayService.documentCheck(sendData);
    }
    if (resource_type === 'cip_checks' && action === 'update') {
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
}
