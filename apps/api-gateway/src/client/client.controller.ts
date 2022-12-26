import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Headers,
  HttpStatus,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { PublicUserDto } from '../utils/public-user.dto';
import { ClientService } from './client.service';
import { CreateRequestDto } from './dto/create.request.dto';
import { DecryptedData, EncryptedGuard } from './guards/encrypted.guard';
import { BaseRegisterRequestDto } from './dto/register.request.dto';
import { Request } from 'express';

@ApiTags('Client')
@Controller({
  version: '1',
  path: 'clients',
})
@UseInterceptors(ClassSerializerInterceptor)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  create(@Body() payload: CreateRequestDto) {
    return this.clientService.create(payload);
  }

  @Post('register')
  @ApiConsumes('application/vnd.skopa.encrypted')
  @ApiBody({ schema: { type: 'string' } })
  @ApiHeader({ name: 'api_key' })
  @UseGuards(EncryptedGuard)
  @ApiResponse({ status: HttpStatus.CREATED, type: PublicUserDto })
  async register(@DecryptedData() decrypted: BaseRegisterRequestDto) {
    const user = await this.clientService.registerSecure(decrypted);

    return plainToInstance(PublicUserDto, user);
  }

  @Post('login')
  @ApiConsumes('application/vnd.skopa.encrypted')
  @ApiBody({ schema: { type: 'string' } })
  @ApiHeader({ name: 'api_key' })
  login(@Req() req: RawBodyRequest<Request>, @Headers('api_key') apiKey: string) {
    return this.clientService.login(req.rawBody, apiKey);
  }
}
