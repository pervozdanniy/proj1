import { Body, Controller, HttpStatus, Logger, Param, Post, Put, Req } from '@nestjs/common';
import { ApiExcludeController, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentGatewayService } from '../services/payment-gateway.service';
import {
  FacilitaWebhookType,
  KoyweWebhookType,
  LinkWebhookType,
  LiquidoDepositWebhookType,
  LiquidoPayoutWebhookType,
  PrimeTrustWebhookType,
} from '../webhooks/data';

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
    this.logger.log(payload);

    return this.paymentGatewayService.primeTrustHandler(payload);
  }

  @Post('/koywe')
  async koyweHandler(@Body() payload: KoyweWebhookType) {
    this.logger.log(payload);

    return this.paymentGatewayService.koyweWebhooksHandler(payload);
  }

  @Post('/facilita')
  async facilitaHandler(@Body() payload: FacilitaWebhookType) {
    this.logger.log(payload);

    return this.paymentGatewayService.facilitaHandler(payload);
  }

  @Post('/liquido')
  async liquidoDepositHandler(@Body() payload: LiquidoDepositWebhookType) {
    return this.paymentGatewayService.liquidoDepositHandler(payload);
  }

  @Post('/liquido/payout')
  async liquidoWithdrawHandler(@Body() payload: LiquidoPayoutWebhookType) {
    return this.paymentGatewayService.liquidoWithdrawHandler(payload);
  }

  @ApiOperation({ summary: 'Catch webhooks.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @Post('/link')
  async linkHandler(@Body() payload: LinkWebhookType) {
    this.logger.log(payload);

    return this.paymentGatewayService.linkHandler(payload);
  }

  @Post('inswitch')
  async inswitchHandler(@Req() req: Request) {
    this.logger.debug('INSWITCH POST', req.body, req.headers);
  }

  @Put('inswitch/:authorizationId')
  async inswitchPutHandler(@Param('authorizationId') authorizationId: string, @Req() req: Request) {
    this.logger.debug('INSWITCH PUT', req.body, authorizationId);
  }
}
