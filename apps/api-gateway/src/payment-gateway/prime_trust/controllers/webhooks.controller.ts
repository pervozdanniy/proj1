import { Body, ClassSerializerInterceptor, Controller, Logger, Post, UseInterceptors } from '@nestjs/common';
import { ApiExcludeController, ApiTags } from '@nestjs/swagger';
import { PaymentGatewayService } from '../services/payment-gateway.service';
import { FacilitaWebhookType, KoyweWebhookType, PrimeTrustWebhookType } from '../webhooks/data';

@ApiTags('Webhooks')
@ApiExcludeController()
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: 'webhook',
})
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);
  constructor(private paymentGatewayService: PaymentGatewayService) {}
  @Post('/prime_trust')
  async primeTrustHandler(@Body() payload: PrimeTrustWebhookType) {
    this.logger.log(payload);

    return this.paymentGatewayService.primeTrustHandler(payload);
  }

  @Post('/koywe')
  async koyweHandler(@Body() payload: KoyweWebhookType) {
    this.logger.log(payload);

    return this.paymentGatewayService.koyweWebhooksHandler(payload);
  }

  @Post('/facilita')
  async payfuraHandler(@Body() payload: FacilitaWebhookType) {
    this.logger.log(payload);

    return this.paymentGatewayService.payfuraHandler(payload);
  }
}
