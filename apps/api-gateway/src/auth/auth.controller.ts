import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Injectable,
  OnModuleInit,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { AuthServiceClient } from '~common/grpc/interfaces/auth';
import { Metadata } from '@grpc/grpc-js';
import { plainToInstance } from 'class-transformer';
import { MeResponseDto } from './dto/me.response.dto';
import { Request } from 'express';

@ApiTags('Auth')
@Injectable()
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: 'auth',
})
export class AuthController implements OnModuleInit {
  private authService: AuthServiceClient;

  constructor(@InjectGrpc('auth') private readonly auth: ClientGrpc) {}

  async onModuleInit() {
    this.authService = this.auth.getService('AuthService');
  }

  @ApiOperation({ summary: 'Login with credentials' })
  @ApiResponse({ status: HttpStatus.OK })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login() {
    return firstValueFrom(this.authService.login({ login: 'pervozadiy@gmail.com', password: '123' }));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse({ status: HttpStatus.OK })
  @HttpCode(HttpStatus.OK)
  @Get('me')
  async me(@Req() request: Request) {
    const metadata = new Metadata();
    const token = request.header('Authorization');
    const jwt = token.substring(7);
    metadata.set('authorization', jwt);

    const user = await firstValueFrom(this.authService.me({}, metadata));

    return plainToInstance(MeResponseDto, user);
  }
}
