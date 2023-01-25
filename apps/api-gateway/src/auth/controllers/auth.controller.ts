import { Body, Controller, Get, HttpCode, HttpStatus, Injectable, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { User } from '~common/grpc/interfaces/common';
import { JwtSessionAuth, JwtSessionUser } from '~common/session';
import { SocialsUserDto } from '~svc/api-gateway/src/auth/dto/socials-user.dto';
import { PublicUserDto } from '../../utils/public-user.dto';
import { TwoFactorRequiredResponseDto } from '../dto/2fa.reponse.dto';
import { AuthRequestDto } from '../dto/auth.request.dto';
import { AuthResponseDto } from '../dto/auth.response.dto';
import { AuthService } from '../services/auth.service';

@ApiTags('Auth')
@Injectable()
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

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse({ status: HttpStatus.OK, type: PublicUserDto })
  @JwtSessionAuth()
  @Get('me')
  async me(@JwtSessionUser() user: User) {
    return plainToInstance(PublicUserDto, user);
  }
}