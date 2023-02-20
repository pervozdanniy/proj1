import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SuccessDto } from '../../utils/success.dto';
import { JwtSessionAuth, JwtSessionId } from '../decorators/jwt-session.decorators';
import { TwoFactorRequiredResponseDto, TwoFactorSuccessResponseDto } from '../dto/2fa.reponse.dto';
import { ResetPasswordFinishDto, ResetPasswordStartDto, ResetPasswordVerifyDto } from '../dto/reset-password.dto';
import { ResetPasswordService } from '../services/reset-password.service';

@ApiTags('Auth')
@Controller({
  version: '1',
  path: 'auth/reset-password',
})
export class ResetPasswordController {
  constructor(private readonly resetService: ResetPasswordService) {}

  @ApiOperation({ summary: 'Check if user is unique and start session' })
  @ApiCreatedResponse({ type: TwoFactorRequiredResponseDto })
  @ApiConflictResponse()
  @Post('start')
  start(@Body() payload: ResetPasswordStartDto) {
    return this.resetService.start(payload);
  }

  @ApiOperation({ summary: 'Verify 2FA codes' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: TwoFactorSuccessResponseDto, description: '2FA completed' })
  @ApiConflictResponse({ description: 'Invalid 2FA code or method' })
  @JwtSessionAuth({ allowUnauthorized: true, allowUnverified: true, requirePasswordReset: true })
  @HttpCode(HttpStatus.OK)
  @Post('verify')
  verify(@Body() payload: ResetPasswordVerifyDto, @JwtSessionId() sessionId: string) {
    return this.resetService.verify(payload, sessionId);
  }

  @ApiOperation({ summary: 'Finish registration process' })
  @ApiCreatedResponse({ type: SuccessDto })
  @ApiBearerAuth()
  @JwtSessionAuth({ allowUnauthorized: true, requirePasswordReset: true })
  @Post('finish')
  finish(@Body() payload: ResetPasswordFinishDto, @JwtSessionId() sessionId: string) {
    return this.resetService.finish(payload, sessionId);
  }
}
