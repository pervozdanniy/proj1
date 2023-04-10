import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { Request } from 'express';
import {
  AgreementResponseDto,
  SuccessResponseDto,
} from '../../payment-gateway/prime_trust/utils/prime-trust-response.dto';
import { PublicUserWithContactsDto } from '../../utils/public-user.dto';
import { JwtSessionAuth, JwtSessionId } from '../decorators/jwt-session.decorators';
import {
  TwoFactorAppliedResponseDto,
  TwoFactorRequiredResponseDto,
  TwoFactorSuccessResponseDto,
} from '../dto/2fa.reponse.dto';
import {
  ChangeAgreementStatusDto,
  CreateAgreementRequestDto,
  RegistrationFinishRequestDto,
  RegistrationStartRequestDto,
  RegistrationVerifyRequestDto,
} from '../dto/registration.dto';
import { IpqualityScoreService } from '../services/ipquality-score.service';
import { RegistrationService } from '../services/registration.service';

@ApiTags('Auth')
@Controller({
  version: '1',
  path: 'auth/registration',
})
export class RegistrationController {
  constructor(
    private readonly registerService: RegistrationService,
    private readonly ipqualityScoreService: IpqualityScoreService,
  ) {}

  @ApiOperation({ summary: 'Check if user is unique and start session' })
  @ApiCreatedResponse({ type: TwoFactorAppliedResponseDto })
  @ApiConflictResponse()
  @Post('start')
  async start(@Body() payload: RegistrationStartRequestDto, @Req() request: Request) {
    await this.ipqualityScoreService.checkUserData(payload, request);

    return this.registerService.start(payload);
  }

  @ApiOperation({ summary: 'Verify 2FA codes' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: TwoFactorSuccessResponseDto, description: '2FA completed' })
  @ApiResponse({
    status: HttpStatus.PRECONDITION_REQUIRED,
    type: TwoFactorRequiredResponseDto,
    description: 'Current 2FA method succeeded, but 2FA is not completed yet',
  })
  @ApiConflictResponse({ description: 'Invalid 2FA code or method' })
  @JwtSessionAuth({ allowUnauthorized: true, allowUnverified: true, requireRegistration: true, allowClosed: true })
  @HttpCode(HttpStatus.OK)
  @Post('verify')
  verify(@Body() payload: RegistrationVerifyRequestDto, @JwtSessionId() sessionId: string) {
    return this.registerService.verify(payload, sessionId);
  }

  @ApiOperation({ summary: 'Create agreement process' })
  @ApiCreatedResponse({ type: AgreementResponseDto })
  @ApiBearerAuth()
  @JwtSessionAuth({ allowUnauthorized: true, requireRegistration: true, require2FA: true, allowClosed: true })
  @Post('create/agreement')
  async createAgreement(@Body() payload: CreateAgreementRequestDto, @JwtSessionId() sessionId: string) {
    return await this.registerService.createAgreement(payload, sessionId);
  }

  @ApiOperation({ summary: 'Approve or decline agreement' })
  @ApiCreatedResponse({ type: SuccessResponseDto })
  @ApiBearerAuth()
  @JwtSessionAuth({ allowUnauthorized: true, requireRegistration: true, require2FA: true, allowClosed: true })
  @Post('approve/agreement')
  async approveAgreement(@Body() payload: ChangeAgreementStatusDto, @JwtSessionId() sessionId: string) {
    return await this.registerService.approveAgreement(payload, sessionId);
  }

  @ApiOperation({ summary: 'Finish registration process' })
  @ApiCreatedResponse({ type: PublicUserWithContactsDto })
  @ApiBearerAuth()
  @JwtSessionAuth({ allowUnauthorized: true, requireRegistration: true, require2FA: true, allowClosed: true })
  @Post('finish')
  async finish(@Body() payload: RegistrationFinishRequestDto, @JwtSessionId() sessionId: string) {
    const user = await this.registerService.finish(payload, sessionId);

    return plainToInstance(PublicUserWithContactsDto, user);
  }
}
