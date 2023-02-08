import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SuccessDto } from '../../utils/success.dto';
import { JwtSessionAuth, JwtSessionId } from '../decorators/jwt-session.decorators';
import {
  TwoFactorDisableRequestDto,
  TwoFactorEnableRequestDto,
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
  @ApiResponse({ status: HttpStatus.OK, type: SuccessDto })
  @HttpCode(HttpStatus.OK)
  @Post('enable')
  @JwtSessionAuth({ allowUnverified: true })
  enable(@Body() payload: TwoFactorEnableRequestDto, @JwtSessionId() sessionId: string) {
    return this.twoFactor.enable(payload, sessionId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable 2FA' })
  @ApiResponse({ status: HttpStatus.OK, type: SuccessDto })
  @HttpCode(HttpStatus.OK)
  @Post('disable')
  @JwtSessionAuth({ allowUnverified: true })
  disable(@Body() payload: TwoFactorDisableRequestDto, @JwtSessionId() sessionId: string) {
    return this.twoFactor.disable(payload.methods, sessionId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify 2FA codes and login' })
  @ApiResponse({ status: HttpStatus.OK, type: SuccessDto })
  @HttpCode(HttpStatus.OK)
  @Post('verify')
  verify(@Body() payload: TwoFactorVerifyRequestDto, @JwtSessionId() sessionId: string) {
    return this.twoFactor.verify(payload, sessionId);
  }
}
