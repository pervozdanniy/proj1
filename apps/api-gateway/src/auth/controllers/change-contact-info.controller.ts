import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtSessionAuth, JwtSessionId } from '~common/http-session';
import { TwoFactorMethodsAppliedDto, TwoFactorSuccessResponseDto } from '../dto/2fa.reponse.dto';
import { ChangeContactVerifyDto, ChangeEmailDto, ChangePhoneDto } from '../dto/change-contact-info.dto';
import { ChangeContactInfoService } from '../services/change-contact-info.service';

@ApiTags('Auth')
@Controller({
  version: '1',
  path: 'auth/change_contact_info',
})
export class ChangeContactInfoController {
  constructor(private readonly changeContactInfo: ChangeContactInfoService) {}

  @ApiOperation({ summary: 'Start email change process' })
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: TwoFactorMethodsAppliedDto })
  @Post('start/email')
  @JwtSessionAuth({ forbidSocial: true })
  async email(@Body() payload: ChangeEmailDto, @JwtSessionId() sessionId: string): Promise<TwoFactorMethodsAppliedDto> {
    return this.changeContactInfo.start(payload, sessionId);
  }

  @ApiOperation({ summary: 'Start phone change process' })
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: TwoFactorMethodsAppliedDto })
  @Post('start/phone')
  @JwtSessionAuth()
  async phone(@Body() payload: ChangePhoneDto, @JwtSessionId() sessionId: string): Promise<TwoFactorMethodsAppliedDto> {
    return this.changeContactInfo.start(payload, sessionId);
  }

  @ApiOperation({ summary: 'Verify 2FA codes and accept email change' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: TwoFactorSuccessResponseDto, description: '2FA completed' })
  @Post('verify')
  @JwtSessionAuth()
  verify(
    @Body() payload: ChangeContactVerifyDto,
    @JwtSessionId() sessionId: string,
  ): Promise<TwoFactorSuccessResponseDto> {
    return this.changeContactInfo.verify(payload, sessionId);
  }
}
