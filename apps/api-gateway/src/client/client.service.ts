import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { ClientServiceClient } from '~common/grpc/interfaces/auth';
import { UserServiceClient } from '~common/grpc/interfaces/core';
import { CreateRequestDto } from './dto/create.request.dto';
import { BaseRegisterRequestDto, RegisterRequestDto } from './dto/register.request.dto';
import { Buffer } from 'node:buffer';

@Injectable()
export class ClientService implements OnModuleInit {
  private userService: UserServiceClient;
  private authClientService: ClientServiceClient;

  constructor(
    @InjectGrpc('core') private readonly core: ClientGrpc,
    @InjectGrpc('auth') private readonly auth: ClientGrpc,
  ) {}

  async onModuleInit() {
    this.userService = this.core.getService('UserService');
    this.authClientService = this.auth.getService('ClientService');
  }

  create(payload: CreateRequestDto) {
    return firstValueFrom(this.authClientService.create(payload));
  }

  async register(payload: RegisterRequestDto, apiKey: string) {
    const client = await firstValueFrom(this.authClientService.validate({ api_key: apiKey }));

    return firstValueFrom(
      this.userService.create({
        username: payload.login,
        email: payload.login,
        password: payload.password,
        country_id: payload.countryId,
        source: client.name,
      }),
    );
  }

  validateEncrypted(encrypted: Buffer, apiKey: string) {
    return firstValueFrom(this.authClientService.validateEncrypted({ api_key: apiKey, encrypted_data: encrypted }));
  }

  registerSecure(payload: BaseRegisterRequestDto) {
    return firstValueFrom(
      this.userService.create({
        username: payload.login,
        email: payload.login,
        country_id: payload.countryId,
        source: 'asymmetric',
      }),
    );
  }

  login(encrypted: Buffer, apiKey: string) {
    const encrypted_data = Buffer.from(encrypted.toString('utf8'), 'base64');

    return firstValueFrom(this.authClientService.login({ encrypted_data, api_key: apiKey }));
  }
}
