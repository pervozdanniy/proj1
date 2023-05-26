import { UserEntity } from '@admin/access/users/user.entity';
import { REFRESH_TOKEN_NAME } from '@modules/auth/constants';
import { Cookies } from '@modules/auth/decorators/cookies.decorator';
import { GetMeResponseDto } from '@modules/auth/dtos/get-me-response.dto';
import { JwtRefreshAuthGuard } from '@modules/auth/guards/jwt-refresh-auth.guard';
import { Body, Controller, Delete, Get, Post, Res, UseGuards, ValidationPipe } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentUser, SkipAuth, TOKEN_NAME } from '.';
import {
  AuthCredentialsRequestDto,
  LoginResponseDto,
  TokenDto,
  ValidateTokenRequestDto,
  ValidateTokenResponseDto,
} from './dtos';
import { AuthService, TokenService } from './services';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private authService: AuthService, private tokenService: TokenService) {}

  @SkipAuth()
  @ApiOperation({ description: 'User authentication' })
  @ApiOkResponse({ description: 'Successfully authenticated user', type: LoginResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Post('/login')
  async login(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsRequestDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseDto> {
    return await this.authService.login(authCredentialsDto, response);
  }

  @ApiOperation({ description: 'User Logout' })
  @ApiOkResponse({ description: 'Successfully User Logout' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Delete('/logout')
  logout(@Res({ passthrough: true }) response: Response): void {
    this.authService.setLogoutCookie(response);
  }

  @ApiBearerAuth(TOKEN_NAME)
  @ApiOperation({ description: 'Get User Information' })
  @ApiOkResponse({ description: 'Successfully Return User Information', type: GetMeResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Get('/me')
  getMe(@CurrentUser() user: UserEntity): Promise<GetMeResponseDto> {
    return this.authService.getMe(user);
  }

  @SkipAuth()
  @UseGuards(JwtRefreshAuthGuard)
  @ApiOperation({ description: 'Renew access in the application' })
  @ApiOkResponse({ description: 'token successfully renewed', type: TokenDto })
  @ApiUnauthorizedResponse({ description: 'Refresh token invalid or expired' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Get('/token/refresh')
  async getNewToken(
    @Cookies(REFRESH_TOKEN_NAME) refreshToken: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<TokenDto> {
    const tokens = this.tokenService.generateRefreshToken(refreshToken);
    this.authService.setAuthCookie(response, tokens.refreshToken);

    return new TokenDto(tokens);
  }

  @SkipAuth()
  @ApiOperation({ description: 'Validate token' })
  @ApiOkResponse({ description: 'Validation was successful', type: ValidateTokenResponseDto })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Post('/token/validate')
  async validateToken(@Body(ValidationPipe) validateToken: ValidateTokenRequestDto): Promise<ValidateTokenResponseDto> {
    const { token } = validateToken;

    return this.tokenService.validateToken(token);
  }
}
