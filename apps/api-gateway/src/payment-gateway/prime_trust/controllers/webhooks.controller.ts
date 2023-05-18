import { Body, Controller, HttpStatus, Logger, Post, Req } from '@nestjs/common';
import { ApiExcludeController, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentGatewayService } from '../services/payment-gateway.service';
import { FacilitaWebhookType, KoyweWebhookType, LiquidoWebhookType, PrimeTrustWebhookType } from '../webhooks/data';

@ApiTags('Webhooks')
@ApiExcludeController()
@Controller({
  version: '1',
  path: 'webhook',
})
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);
  constructor(private paymentGatewayService: PaymentGatewayService) {}
  @Post('/prime_trust')
  async primeTrustHandler(@Body() payload: PrimeTrustWebhookType) {
    if (payload.resource_type === 'contingent_holds') {
      this.logger.log(payload.resource_id);
    }

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

  @Post('/liquido')
  async liquidoHandler(@Body() payload: LiquidoWebhookType) {
    return this.paymentGatewayService.liquidoHandler(payload);
  }

  @ApiOperation({ summary: 'Catch webhooks.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @Post('/link')
  async linkHandler(@Body() payload: any) {
    this.logger.log(payload);
  }

  @Post('inswitch')
  async inswitchHandler(@Req() req: Request) {
    this.logger.debug('INSWITCH', req.body, req.headers);
  }
}
