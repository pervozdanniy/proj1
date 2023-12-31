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
  @ApiUnauthorizedResponse()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() { login, password }: AuthRequestDto): Promise<AuthResponseDto> {
    return this.authService.login({ login, password });
  }

  @ApiOperation({ summary: 'Login use facebook user' })
  @ApiResponse({ status: HttpStatus.OK, type: AuthResponseDto })
  @ApiUnauthorizedResponse()
  @Post('socials/login')
  loginSocials(@Body() payload: SocialsUserDto): Promise<AuthResponseDto> {
    return this.authService.loginSocials(payload);
  }

  @ApiOperation({ summary: 'Login use facebook user' })
  @ApiResponse({ status: HttpStatus.OK, type: AuthResponseDto })
  @Post('socials/registration')
  registerSocials(@Body() payload: RegisterSocialsUserDto) {
    return this.authService.registerSocials(payload);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse({ status: HttpStatus.OK, type: PublicUserDto })
  @JwtSessionAuth({ allowClosed: true })
  @Get('me')
  me(@JwtSessionUser() user: User) {
    return plainToInstance(PublicUserDto, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'User account close' })
  @JwtSessionAuth()
  @ApiOkResponse({
    description: 'Account closed successfully.',
    type: PublicUserDto,
  })
  @HttpCode(HttpStatus.OK)
  @Post('account/close')
  closeAccount(@JwtSessionId() sessionId: string) {
    return this.authService.closeAccount(sessionId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'User account open' })
  @JwtSessionAuth()
  @ApiOkResponse({
    description: 'Account opened successfully.',
    type: PublicUserDto,
  })
  @HttpCode(HttpStatus.OK)
  @Post('account/open')
  openAccount(@Body() { user_id }: OpenAccountRequestDto) {
    return this.authService.openAccount({ id: user_id });
  }

  @ApiOperation({ summary: 'Refresh tokens via refresh_token' })
  @ApiOkResponse({
    description: 'New access and refresh token pair',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refreshToken(@Body() { token }: RefreshRequestDto) {
    return this.authService.refreshToken(token);
  }
}
