import { Body, Controller, Get, HttpCode, HttpStatus, Injectable, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { User } from '~common/grpc/interfaces/common';
import { JwtSessionGuard, JwtSessionUser } from '~common/session';
import { SocialsUserDto } from '~svc/api-gateway/src/auth/dto/socials-user.dto';
import { PublicUserDto } from '../utils/public-user.dto';
import { AuthService } from './auth.service';
import { AuthRequestDto } from './dto/auth.request.dto';
import { AuthResponseDto } from './dto/auth.response.dto';

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
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() { login, password }: AuthRequestDto) {
    return this.authService.login({ login, password });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse({ status: HttpStatus.OK, type: PublicUserDto })
  @UseGuards(JwtSessionGuard)
  @Get('me')
  async me(@JwtSessionUser() user: User) {
    return plainToInstance(PublicUserDto, user);
  }

  @ApiOperation({ summary: 'Login use facebook user' })
  @Post('socials/login')
  loginSocials(@Body() payload: SocialsUserDto) {
    return this.authService.loginSocials(payload);
  }
}
