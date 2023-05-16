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
import {
  TwoFactorAppliedResponseDto,
  TwoFactorRequiredResponseDto,
  TwoFactorSuccessResponseDto,
} from '../dto/2fa.reponse.dto';
import { ChangePasswordTypeDto } from '../dto/change-password-type.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { ResetPasswordFinishDto, ResetPasswordVerifyDto } from '../dto/reset-password.dto';
import { ResetPasswordService } from '../services/reset-password.service';

@ApiTags('Auth')
@Controller({
  version: '1',
  path: 'auth/change_password',
})
export class ChangePasswordController {
  constructor(private readonly resetService: ResetPasswordService) {}

  @ApiOperation({ summary: 'Check change password type' })
  @ApiBearerAuth()
  @JwtSessionAuth({ allowClosed: true, forbidSocial: true })
  @ApiCreatedResponse({ type: TwoFactorAppliedResponseDto })
  @ApiConflictResponse()
  @Post('start')
  start(@Body() { type }: ChangePasswordTypeDto, @JwtSessionId() sessionId: string) {
    return this.resetService.changePasswordStart({ type }, sessionId);
  }

  @ApiOperation({ summary: 'Verify 2FA codes' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: TwoFactorSuccessResponseDto, description: '2FA completed' })
  @ApiConflictResponse({ description: 'Invalid 2FA code or method' })
  @JwtSessionAuth({ requirePasswordReset: true, allowUnverified: true, allowClosed: true })
  @HttpCode(HttpStatus.OK)
  @Post('verify')
  verify(@Body() payload: ResetPasswordVerifyDto, @JwtSessionId() sessionId: string) {
    return this.resetService.verify(payload, sessionId);
  }

  @ApiOperation({ summary: 'Finish change password process' })
  @ApiCreatedResponse({ type: SuccessDto })
  @ApiBearerAuth()
  @JwtSessionAuth({ requirePasswordReset: true, allowClosed: true })
  @Post('finish')
  finish(@Body() payload: ResetPasswordFinishDto, @JwtSessionId() sessionId: string) {
    return this.resetService.finish(payload, sessionId);
  }

  @ApiOperation({ summary: 'Change old password' })
  @ApiBearerAuth()
  @JwtSessionAuth({ allowClosed: true })
  @ApiCreatedResponse({ type: TwoFactorRequiredResponseDto })
  @ApiConflictResponse()
  @Post('old')
  change(@Body() payload: ChangePasswordDto, @JwtSessionId() sessionId: string) {
    return this.resetService.changeOldPassword(payload, sessionId);
  }
}
