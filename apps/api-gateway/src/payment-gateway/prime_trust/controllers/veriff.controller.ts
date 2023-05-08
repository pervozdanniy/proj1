import { JwtSessionAuth, JwtSessionUser } from '@/auth';
import { PaymentGatewayService } from '@/payment-gateway/prime_trust/services/payment-gateway.service';
import { Body, ClassSerializerInterceptor, Controller, HttpStatus, Post, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '~common/grpc/interfaces/common';
import { SocureDocumentDto } from '../dtos/main/socure.document.dto';
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
  constructor(private paymentGatewayService: PaymentGatewayService) {}

  @Post('link')
  @ApiOkResponse({ type: VeriffSessionResponseDto })
  @ApiBearerAuth()
  @JwtSessionAuth()
  link(@JwtSessionUser() { id: user_id }: User, @Body() { type }: VeriffDocumentTypeDto) {
    return this.paymentGatewayService.generateVeriffLink({ user_id, type });
  }

  @ApiOperation({ summary: 'Create veriff document.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @Post('/create/socure/document')
  async createSocureDocument(@Body() payload: SocureDocumentDto) {
    return this.paymentGatewayService.createSocureDocument(payload);
  }

  @ApiOperation({ summary: 'Submit session id.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @Post('/webhook')
  async veriffWebhookHandler(@Body() payload: VeriffWebhookDto) {
    return this.paymentGatewayService.veriffWebhookHandler(payload);
  }

  @ApiOperation({ summary: 'Submit session id.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @Post('/hook')
  async veriffHookHandler(@Body() payload: VeriffHookDto) {
    return this.paymentGatewayService.veriffHookHandler(payload);
  }
}
