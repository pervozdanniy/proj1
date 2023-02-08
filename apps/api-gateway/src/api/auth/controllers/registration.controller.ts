import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { PreRegisteredSessionInterface } from '~common/constants/auth/registration/interfaces';
import { SessionProxy } from '~common/session';
import { PublicUserDto } from '../../utils/public-user.dto';
import { JwtSession, JwtSessionAuth } from '../decorators/jwt-session.decorators';
import { TwoFactorRequiredResponseDto } from '../dto/2fa.reponse.dto';
import { RegistrationFinishRequestDto, RegistrationStartRequestDto } from '../dto/registration.dto';
import { RegistrationService } from '../services/registration.service';

@ApiTags('Auth')
@Controller({
  version: '1',
  path: 'auth/registration',
})
export class RegistrationController {
  constructor(private readonly registerService: RegistrationService) {}

  @ApiOperation({ summary: 'Check if user is unique and start session' })
  @ApiResponse({ status: HttpStatus.CREATED, type: TwoFactorRequiredResponseDto })
  @ApiUnauthorizedResponse()
  @Post('start')
  start(@Body() payload: RegistrationStartRequestDto) {
    return this.registerService.start(payload);
  }

  @ApiOperation({ summary: 'Finish registration process' })
  @ApiResponse({ status: HttpStatus.CREATED, type: PublicUserDto })
  @ApiBearerAuth()
  @JwtSessionAuth({ allowUnauthorized: true, requirePreRegistration: true, require2FA: true })
  @Post('finish')
  async finish(
    @Body() payload: RegistrationFinishRequestDto,
    @JwtSession() session: SessionProxy<PreRegisteredSessionInterface>,
  ) {
    const user = await this.registerService.finish(payload, session);

    return plainToInstance(PublicUserDto, user);
  }
}
