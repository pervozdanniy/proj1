import { Metadata } from '@grpc/grpc-js';
import { UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { GrpcSession, SessionProxy } from '~common/grpc-session';
import {
  AuthClient,
  AuthData,
  ClientCreateRequest,
  ClientServiceController,
  ClientServiceControllerMethods,
  SignedRequest,
} from '~common/grpc/interfaces/auth';
import { User } from '~common/grpc/interfaces/common';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { ClientService } from './client.service';
import { ApiKey } from './decorators/api-key.decorator';
import { SignedLoginRequestDto, UnsignedLoginRequestDto } from './dto/login.request.dto';
import { SignedRegisterRequest, UnsignedRegisterRequest } from './dto/register.request.dto';

@RpcController()
@ClientServiceControllerMethods()
export class ClientController implements ClientServiceController {
  constructor(private readonly clientService: ClientService) {}

  async create(payload: ClientCreateRequest): Promise<AuthClient> {
    const client = await this.clientService.create(payload);

    return {
      name: client.name,
      key: client.key,
      is_secure: !!client.secret,
    };
  }

  async validate(request: SignedRequest, metadata: Metadata): Promise<AuthClient> {
    const [apiKey] = metadata.get('api-key');

    return this.clientService.validate(request, apiKey?.toString());
  }

  async login(
    @Payload() request: SignedRequest,
    @GrpcSession() session: SessionProxy,
    @ApiKey() apiKey: string,
  ): Promise<AuthData> {
    const client = await this.clientService.validate(request, apiKey);
    if (!client) {
      throw new UnauthorizedException();
    }
    const data = JSON.parse(Buffer.from(request.data).toString('utf8'));
    const pipe = new ValidationPipe({ transform: true, whitelist: true });
    const payload: SignedLoginRequestDto = await pipe.transform(data, {
      type: 'body',
      metatype: client.is_secure ? SignedLoginRequestDto : UnsignedLoginRequestDto,
    });

    return this.clientService.login(payload, client, session);
  }

  async register(@Payload() request: SignedRequest, @ApiKey() apiKey: string): Promise<User> {
    const client = await this.clientService.validate(request, apiKey);
    if (!client) {
      throw new UnauthorizedException();
    }
    const data = JSON.parse(Buffer.from(request.data).toString('utf8'));
    const pipe = new ValidationPipe({ transform: true, whitelist: true });
    const payload = await pipe.transform(data, {
      type: 'body',
      metatype: client.is_secure ? SignedRegisterRequest : UnsignedRegisterRequest,
    });

    return this.clientService.register(payload, client);
  }
}
