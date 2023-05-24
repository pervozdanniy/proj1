import { JwtSessionAuth, JwtSessionUser } from '@/auth';
import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '~common/grpc/interfaces/common';
import { VeriffHookDto } from '../dtos/veriff/veriff-hook.dto';
import { VeriffSessionResponseDto } from '../dtos/veriff/veriff-session-response.dto';
import { VeriffWebhookDto } from '../dtos/veriff/veriff-webhook.dto';
import { PaymentGatewayService } from '../services/payment-gateway.service';

@ApiTags('KYC')
@Controller({
  version: '1',
  path: 'kyc',
})
export class KYCController {
  constructor(private paymentGatewayService: PaymentGatewayService) {}

  @Post('/link')
  @ApiOkResponse({ type: VeriffSessionResponseDto })
  @ApiBearerAuth()
  @JwtSessionAuth()
  link(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.generateVeriffLink({ id });
  }

  @ApiOperation({ summary: 'Webhook catch' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @Post('/webhook')
  async veriffWebhookHandler(@Body() payload: VeriffWebhookDto) {
    return this.paymentGatewayService.veriffWebhookHandler(payload);
  }

  @ApiOperation({ summary: 'Hook catch' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @Post('/hook')
  async veriffHookHandler(@Body() payload: VeriffHookDto) {
    return this.paymentGatewayService.veriffHookHandler(payload);
  }
}
