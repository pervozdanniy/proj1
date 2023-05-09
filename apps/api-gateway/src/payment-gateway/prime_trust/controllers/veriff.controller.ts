import { JwtSessionAuth, JwtSessionUser } from '@/auth';
import { PaymentGatewayService } from '@/payment-gateway/prime_trust/services/payment-gateway.service';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpStatus,
  Logger,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '~common/grpc/interfaces/common';
import { VeriffDocumentTypeDto } from '../dtos/veriff/document-type.dto';
import { VeriffHookDto } from '../dtos/veriff/veriff-hook.dto';
import { VeriffSessionResponseDto } from '../dtos/veriff/veriff-session-response.dto';
import { VeriffWebhookDto } from '../dtos/veriff/veriff-webhook.dto';

@ApiTags('Veriff KYC')
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: 'veriff',
})
export class VeriffController {
  private readonly logger = new Logger(VeriffController.name);
  constructor(private paymentGatewayService: PaymentGatewayService) {}

  @Post('link')
  @ApiOkResponse({ type: VeriffSessionResponseDto })
  @ApiBearerAuth()
  @JwtSessionAuth()
  link(@JwtSessionUser() { id: user_id }: User, @Body() { type }: VeriffDocumentTypeDto) {
    return this.paymentGatewayService.generateVeriffLink({ user_id, type });
  }

  @ApiOperation({ summary: 'Webhook catch' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @Post('/webhook')
  async veriffWebhookHandler(@Body() payload: VeriffWebhookDto) {
    this.logger.log(payload);

    return this.paymentGatewayService.veriffWebhookHandler(payload);
  }

  @ApiOperation({ summary: 'Hook catch' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @Post('/hook')
  async veriffHookHandler(@Body() payload: VeriffHookDto) {
    this.logger.log(payload);

    return this.paymentGatewayService.veriffHookHandler(payload);
  }

  @ApiOperation({ summary: 'Notification after proof address' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @Post('/notification')
  async veriffNotification(@Body() payload: any) {
    this.logger.log(payload);
  }
}
