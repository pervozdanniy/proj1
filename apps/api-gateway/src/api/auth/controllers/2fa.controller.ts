import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SuccessDto } from '../../utils/success.dto';
import { JwtSessionAuth, JwtSessionId } from '../decorators/jwt-session.decorators';
import { TwoFactorSuccessResponseDto } from '../dto/2fa.reponse.dto';
import {
  TwoFactorDisableRequestDto,
  TwoFactorEnableRequestDto,
  TwoFactorResendRequestDto,
  TwoFactorVerifyRequestDto,
} from '../dto/2fa.request.dto';
import { TwoFactorService } from '../services/2fa.service';

@ApiTags('Auth')
@Controller({
  version: '1',
  path: 'auth/2fa',
})
export class TwoFactorController {
  constructor(private readonly twoFactor: TwoFactorService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable 2FA' })
  @ApiOkResponse({ type: SuccessDto })
  @HttpCode(HttpStatus.OK)
  @Post('enable')
  @JwtSessionAuth({ allowUnverified: true })
  enable(@Body() payload: TwoFactorEnableRequestDto, @JwtSessionId() sessionId: string) {
    return this.twoFactor.enable(payload, sessionId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable 2FA' })
  @ApiOkResponse({ type: SuccessDto })
  @HttpCode(HttpStatus.OK)
  @Post('disable')
  @JwtSessionAuth({ allowUnverified: true })
  disable(@Body() payload: TwoFactorDisableRequestDto, @JwtSessionId() sessionId: string) {
    return this.twoFactor.disable(payload.methods, sessionId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify 2FA codes and login' })
  @ApiOkResponse({ type: TwoFactorSuccessResponseDto })
  @HttpCode(HttpStatus.OK)
  @Post('verify')
  verify(@Body() payload: TwoFactorVerifyRequestDto, @JwtSessionId() sessionId: string) {
    return this.twoFactor.verify(payload, sessionId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resend 2FA code' })
  @ApiOkResponse({ type: TwoFactorSuccessResponseDto })
  @HttpCode(HttpStatus.OK)
  @Post('resend')
  resend(@Body() { method }: TwoFactorResendRequestDto, @JwtSessionId() sessionId: string) {
    return this.twoFactor.resend(method, sessionId);
  }
}
