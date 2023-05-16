import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { User } from '~common/grpc/interfaces/common';
import { PublicUserDto } from '../../utils/public-user.dto';
import { JwtSessionAuth, JwtSessionId, JwtSessionUser } from '../decorators/jwt-session.decorators';
import { TwoFactorRequiredResponseDto } from '../dto/2fa.reponse.dto';
import { AuthRequestDto, RefreshRequestDto } from '../dto/auth.request.dto';
import { AuthResponseDto } from '../dto/auth.response.dto';
import { OpenAccountRequestDto } from '../dto/open-account.request.dto';
import { RegisterSocialsUserDto } from '../dto/register-socials-user.dto';
import { SocialsUserDto } from '../dto/socials-user.dto';
import { AuthService } from '../services/auth.service';

@ApiTags('Auth')
@Controller({
  version: '1',
  path: 'auth',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login with credentials' })
  @ApiResponse({ status: HttpStatus.OK, type: AuthResponseDto })
  @ApiResponse({ status: HttpStatus.PRECONDITION_REQUIRED, type: TwoFactorRequiredResponseDto })
  @ApiUnauthorizedResponse()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() { login, password }: AuthRequestDto) {
    return this.authService.login({ login, password });
  }

  @ApiOperation({ summary: 'Login use facebook user' })
  @ApiResponse({ status: HttpStatus.OK, type: AuthResponseDto })
  @ApiResponse({ status: HttpStatus.PRECONDITION_REQUIRED, type: TwoFactorRequiredResponseDto })
  @Post('socials/login')
  loginSocials(@Body() payload: SocialsUserDto) {
    return this.authService.loginSocials(payload);
  }

  @ApiOperation({ summary: 'Login use facebook user' })
  @ApiResponse({ status: HttpStatus.OK, type: AuthResponseDto })
  @ApiResponse({ status: HttpStatus.PRECONDITION_REQUIRED, type: TwoFactorRequiredResponseDto })
  @Post('socials/registration')
  registerSocials(@Body() payload: RegisterSocialsUserDto) {
    return this.authService.registerSocials(payload);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse({ status: HttpStatus.OK, type: PublicUserDto })
  @JwtSessionAuth({ allowClosed: true })
  @Get('me')
  async me(@JwtSessionUser() user: User) {
    return plainToInstance(PublicUserDto, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'User account close' })
  @JwtSessionAuth()
  @ApiResponse({
    description: 'Account closed successfully.',
    type: PublicUserDto,
  })
  @Post('account/close')
  closeAccount(@JwtSessionId() sessionId: string) {
    return this.authService.closeAccount(sessionId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'User account open' })
  @JwtSessionAuth()
  @ApiResponse({
    description: 'Account opened successfully.',
    type: PublicUserDto,
  })
  @Post('account/open')
  openAccount(@Body() { user_id }: OpenAccountRequestDto) {
    return this.authService.openAccount({ id: user_id });
  }

  @ApiOperation({ summary: 'User account open' })
  @ApiOkResponse({
    description: 'New access and refresh token pair',
    type: AuthResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refreshToken(@Body() { token }: RefreshRequestDto) {
    return this.authService.refreshToken(token);
  }
}
