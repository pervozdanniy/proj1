import { UserEntity } from '@admin/access/users/user.entity';
import { GetMeResponseDto } from '@modules/auth/dtos/get-me-response.dto';
import { Body, Controller, Get, Post, ValidationPipe } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser, SkipAuth, TOKEN_NAME } from '.';
import {
  AuthCredentialsRequestDto,
  LoginResponseDto,
  RefreshTokenRequestDto,
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
  login(@Body(ValidationPipe) authCredentialsDto: AuthCredentialsRequestDto): Promise<LoginResponseDto> {
    return this.authService.login(authCredentialsDto);
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
  @ApiOperation({ description: 'Renew access in the application' })
  @ApiOkResponse({ description: 'token successfully renewed', type: TokenDto })
  @ApiUnauthorizedResponse({ description: 'Refresh token invalid or expired' })
  @ApiInternalServerErrorResponse({ description: 'Server error' })
  @Post('/token/refresh')
  async getNewToken(@Body(ValidationPipe) refreshTokenDto: RefreshTokenRequestDto): Promise<TokenDto> {
    const { refreshToken } = refreshTokenDto;

    return this.tokenService.generateRefreshToken(refreshToken);
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
