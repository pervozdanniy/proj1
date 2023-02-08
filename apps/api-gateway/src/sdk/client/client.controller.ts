import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpStatus,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Buffer } from 'node:buffer';
import { AuthClient as AuthClientInterface } from '~common/grpc/interfaces/auth';
import { SuccessDto } from '../utils/success.dto';
import { ClientService } from './client.service';
import { AuthClient } from './decorators/auth-client.decorator';
import { CreateRequestDto } from './dto/create.request.dto';
import { LoginRequestDto } from './dto/login.request.dto';
import { RegisterRequestDto } from './dto/register.request.dto';
import { AuthClientGuard } from './guards/auth-client.guard';

@ApiTags('SDK/Client')
@Controller({
  version: '1',
  path: 'sdk/clients',
})
@UseInterceptors(ClassSerializerInterceptor)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  create(@Body() payload: CreateRequestDto) {
    return this.clientService.create(payload);
  }

  @Post('register')
  @UseGuards(AuthClientGuard)
  @ApiBody({ type: RegisterRequestDto })
  @ApiHeader({ name: 'signature' })
  @ApiHeader({ name: 'api-key' })
  @ApiResponse({ status: HttpStatus.CREATED, type: SuccessDto })
  async register(@Body() payload: RegisterRequestDto, @AuthClient() client: AuthClientInterface) {
    await this.clientService.registerUser(payload, client);

    return { success: true };
  }

  @Post('login')
  @ApiBody({ type: LoginRequestDto })
  @ApiHeader({ name: 'signature' })
  @ApiHeader({ name: 'api-key' })
  login(@Req() req: RawBodyRequest<Request>) {
    const sign = req.header('signature');
    const apiKey = req.header('api-key');

    return this.clientService.loginUser(
      { data: req.rawBody, signature: sign ? Buffer.from(sign, 'hex') : undefined },
      apiKey,
    );
  }
}
