import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtSessionAuth, JwtSessionId } from '~common/http-session';
import { TwoFactorAppliedResponseDto, TwoFactorSuccessResponseDto } from '../dto/2fa.reponse.dto';
import { ChangeContactVerifyDto, ChangeEmailDto, ChangePhoneDto } from '../dto/change-contact-info.dto';
import { ChangeContactInfoService } from '../services/change-contact-info.service';

@ApiTags('Auth')
@Controller({
  version: '1',
  path: 'auth/change-contact-info',
})
export class ChangeContactInfoController {
  constructor(private readonly changeContactInfo: ChangeContactInfoService) {}

  @ApiOperation({ summary: 'Start email change process' })
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: TwoFactorAppliedResponseDto })
  @Post('start/email')
  @JwtSessionAuth()
  async email(
    @Body() payload: ChangeEmailDto,
    @JwtSessionId() sessionId: string,
  ): Promise<TwoFactorAppliedResponseDto> {
    const verify = await this.changeContactInfo.start(payload, sessionId);

    return { verify };
  }

  @ApiOperation({ summary: 'Start phone change process' })
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: TwoFactorAppliedResponseDto })
  @Post('start/phone')
  @JwtSessionAuth()
  async phone(
    @Body() payload: ChangePhoneDto,
    @JwtSessionId() sessionId: string,
  ): Promise<TwoFactorAppliedResponseDto> {
    const verify = await this.changeContactInfo.start(payload, sessionId);

    return { verify };
  }

  @ApiOperation({ summary: 'Verify 2FA codes' })
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
