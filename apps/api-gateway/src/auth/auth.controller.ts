import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Injectable,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthRequestDto } from './dto/auth.request.dto';
import { AuthService } from './auth.service';
import { JwtSessionGuard, JwtSessionUser } from '~common/session';
import { User } from '~common/grpc/interfaces/common';

@ApiTags('Auth')
@Injectable()
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: 'auth',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login with credentials' })
  @ApiResponse({ status: HttpStatus.OK })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() { login, password }: AuthRequestDto) {
    return this.authService.login({ login, password });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse({ status: HttpStatus.OK })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtSessionGuard)
  @Get('me')
  async me(@JwtSessionUser() user: User) {
    return user;
  }
}
