import { AgreementResponseDto } from '@/payment-gateway/utils/prime-trust-response.dto';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { PublicUserWithContactsDto } from '../../utils/public-user.dto';
import { JwtSessionAuth, JwtSessionId } from '../decorators/jwt-session.decorators';
import { TwoFactorVerifyResponseDto } from '../dto/2fa.reponse.dto';
import { AuthResponseDto } from '../dto/auth.response.dto';
import {
  CreateAgreementRequestDto,
  RegistrationFinishRequestDto,
  RegistrationStartRequestDto,
  RegistrationVerifyRequestDto,
  SimpleRegistrationRequestDto,
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

  @ApiOperation({ summary: 'Check if user is unique and start registration process' })
  @ApiCreatedResponse({ type: AuthResponseDto })
  @ApiConflictResponse()
  @Post('start')
  async start(@Body() payload: RegistrationStartRequestDto): Promise<AuthResponseDto> {
    await this.ipqualityScoreService.checkUserData(payload);

    return this.registerService.start(payload);
  }

  @ApiOperation({ summary: 'Verify 2FA codes' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: TwoFactorVerifyResponseDto, description: '2FA completed or partially accepted' })
  @ApiConflictResponse({ description: 'Invalid 2FA code or method' })
  @JwtSessionAuth({ allowUnauthorized: true, allowUnverified: true, requireRegistration: true, allowClosed: true })
  @HttpCode(HttpStatus.OK)
  @Post('verify')
  verify(
    @Body() payload: RegistrationVerifyRequestDto,
    @JwtSessionId() sessionId: string,
  ): Promise<TwoFactorVerifyResponseDto> {
    return this.registerService.verify(payload, sessionId);
  }

  @ApiOperation({ summary: 'Generate agreement' })
  @ApiCreatedResponse({ type: AgreementResponseDto })
  @ApiBearerAuth()
  @JwtSessionAuth({ allowUnauthorized: true, requireRegistration: true, require2FA: true, allowClosed: true })
  @Post('create/agreement')
  createAgreement(@Body() payload: CreateAgreementRequestDto, @JwtSessionId() sessionId: string) {
    return this.registerService.createAgreement(payload, sessionId);
  }

  @ApiOperation({ summary: 'Finish registration process and login created user' })
  @ApiCreatedResponse({ type: PublicUserWithContactsDto })
  @ApiBearerAuth()
  @JwtSessionAuth({ allowUnauthorized: true, requireRegistration: true, require2FA: true, allowClosed: true })
  @Post('finish')
  async finish(@Body() payload: RegistrationFinishRequestDto, @JwtSessionId() sessionId: string) {
    const user = await this.registerService.finish(payload, sessionId);

    return plainToInstance(PublicUserWithContactsDto, user);
  }

  @ApiOperation({ summary: 'Perform user registration with one step' })
  @ApiCreatedResponse({ type: PublicUserWithContactsDto })
  @Post('simple')
  async simple(@Body() payload: SimpleRegistrationRequestDto) {
    const user = await this.registerService.simple(payload);

    return plainToInstance(PublicUserWithContactsDto, user);
  }
}
