import { Body, Controller, Get, HttpCode, HttpStatus, Injectable, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthRequestDto } from './dto/auth.request.dto';
import { AuthService } from './auth.service';
import { JwtSessionGuard, JwtSessionUser } from '~common/session';
import { User } from '~common/grpc/interfaces/common';
import { PublicUserDto } from '../utils/public-user.dto';
import { AuthResponseDto } from './dto/auth.response.dto';
import { plainToInstance } from 'class-transformer';

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
}
