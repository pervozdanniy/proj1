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
import { TwoFactorVerifyResponseDto } from '../dto/2fa.reponse.dto';
import { AuthResponseDto } from '../dto/auth.response.dto';
import { ResetPasswordFinishDto, ResetPasswordStartDto, ResetPasswordVerifyDto } from '../dto/reset-password.dto';
import { ResetPasswordService } from '../services/reset-password.service';

@ApiTags('Auth')
@Controller({
  version: '1',
  path: 'auth/reset_password',
})
export class ResetPasswordController {
  constructor(private readonly resetService: ResetPasswordService) {}

  @ApiOperation({ summary: 'Start reset password process for specified user' })
  @ApiCreatedResponse({ type: AuthResponseDto })
  @ApiConflictResponse()
  @Post('start')
  start(@Body() payload: ResetPasswordStartDto): Promise<AuthResponseDto> {
    return this.resetService.start(payload);
  }

  @ApiOperation({ summary: 'Verify 2FA codes' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: TwoFactorVerifyResponseDto, description: '2FA completed' })
  @ApiConflictResponse({ description: 'Invalid 2FA code or method' })
  @JwtSessionAuth({ allowUnauthorized: true, allowUnverified: true, requirePasswordReset: true, allowClosed: true })
  @HttpCode(HttpStatus.OK)
  @Post('verify')
  verify(
    @Body() payload: ResetPasswordVerifyDto,
    @JwtSessionId() sessionId: string,
  ): Promise<TwoFactorVerifyResponseDto> {
    return this.resetService.verify(payload, sessionId);
  }

  @ApiOperation({ summary: 'Finish password reset process' })
  @ApiCreatedResponse({ type: SuccessDto })
  @ApiBearerAuth()
  @JwtSessionAuth({ allowUnauthorized: true, requirePasswordReset: true, allowClosed: true })
  @Post('finish')
  finish(@Body() payload: ResetPasswordFinishDto, @JwtSessionId() sessionId: string) {
    return this.resetService.finish(payload, sessionId);
  }
}
