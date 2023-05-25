import { JwtSessionAuth, JwtSessionUser } from '@/auth';
import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '~common/grpc/interfaces/common';
import { VeriffSessionResponseDto } from '../dtos/kyc/kyc-session.dto';
import { DecisionWebhookDto, EventWebhookDto } from '../dtos/kyc/kyc-webhook.dto';
import { KYCService } from '../services/kyc.service';

@ApiTags('KYC')
@Controller({
  version: '1',
  path: 'kyc',
})
export class KYCController {
  constructor(private kyc: KYCService) {}

  @Post('/link')
  @ApiOkResponse({ type: VeriffSessionResponseDto })
  @ApiBearerAuth()
  @JwtSessionAuth()
  link(@JwtSessionUser() { id }: User) {
    return this.kyc.generateLink(id);
  }

  @ApiOperation({ summary: 'Decision webhook' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @Post('/webhook/decision')
  async veriffWebhookHandler(@Body() payload: DecisionWebhookDto) {
    return this.kyc.decisionHandler(payload);
  }

  @ApiOperation({ summary: 'Event webhook' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @Post('/webhook/event')
  async veriffHookHandler(@Body() payload: EventWebhookDto) {
    return this.kyc.eventHandler(payload);
  }
}
