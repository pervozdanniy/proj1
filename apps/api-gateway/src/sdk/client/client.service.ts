import { Metadata } from '@grpc/grpc-js';
import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { AuthClient, ClientServiceClient, SignedRequest } from '~common/grpc/interfaces/auth';
import { UserServiceClient } from '~common/grpc/interfaces/core';
import { CreateRequestDto } from './dto/create.request.dto';
import { RegisterRequestDto } from './dto/register.request.dto';

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

  async validate(data: SignedRequest, apiKey: string): Promise<AuthClient> {
    const metadata = new Metadata();
    metadata.set('api_key', apiKey);

    let client: AuthClient;
    try {
      client = await firstValueFrom(this.authClientService.validate(data, metadata));
    } catch {
      throw new UnauthorizedException();
    }

    return client;
  }

  async registerUser(payload: RegisterRequestDto, client?: AuthClient) {
    if (!client || (!payload.password && !payload.secure)) {
      throw new UnauthorizedException();
    }

    return firstValueFrom(
      this.userService.create({
        username: payload.login,
        email: payload.login,
        password: payload.password ?? null,
        country_id: payload.countryId,
        source: client.name,
        contacts: [],
      }),
    );
  }

  loginUser(payload: SignedRequest, apiKey: string) {
    const metadata = new Metadata();
    metadata.set('api_key', apiKey);

    return firstValueFrom(this.authClientService.login(payload, metadata));
  }
}
