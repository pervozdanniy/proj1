import { Metadata } from '@grpc/grpc-js';
import { Injectable, Logger, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { AuthClient, ClientServiceClient, SignedRequest } from '~common/grpc/interfaces/auth';
import { CreateRequestDto } from './dto/create.request.dto';

@Injectable()
export class ClientService implements OnModuleInit {
  private readonly logger = new Logger(ClientService.name);
  private authClientService: ClientServiceClient;

  constructor(@InjectGrpc('auth') private readonly auth: ClientGrpc) {}

  async onModuleInit() {
    this.authClientService = this.auth.getService('ClientService');
  }

  create(payload: CreateRequestDto) {
    return firstValueFrom(this.authClientService.create(payload));
  }

  async validate(data: SignedRequest, apiKey: string): Promise<AuthClient> {
    const metadata = new Metadata();
    metadata.set('api-key', apiKey);

    let client: AuthClient;
    try {
      client = await firstValueFrom(this.authClientService.validate(data, metadata));
    } catch (error) {
      this.logger.debug('Validation failed', { apiKey, error });

      throw new UnauthorizedException(error.message);
    }

    return client;
  }

  async registerUser(payload: SignedRequest, apiKey: string) {
    const metadata = new Metadata();
    metadata.set('api-key', apiKey);

    return firstValueFrom(this.authClientService.register(payload, metadata));
  }

  loginUser(payload: SignedRequest, apiKey: string) {
    const metadata = new Metadata();
    metadata.set('api-key', apiKey);

    return firstValueFrom(this.authClientService.login(payload, metadata));
  }
}
