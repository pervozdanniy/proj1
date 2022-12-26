import { ValidationPipe } from '@nestjs/common';
import {
  AuthData,
  ClientCreateRequest,
  ClientCreateResponse,
  ClientEncryptedRequest,
  ClientServiceController,
  ClientServiceControllerMethods,
  ClientValidateEncryptedResponse,
  ClientValidateRequest,
} from '~common/grpc/interfaces/auth';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { LoginRequestDto } from './dto/login.request.dto';
import { ClientService } from './client.service';

@RpcController()
@ClientServiceControllerMethods()
export class ClientController implements ClientServiceController {
  constructor(private readonly clientService: ClientService) {}

  async login(request: ClientEncryptedRequest): Promise<AuthData> {
    const { decrypted_data } = await this.clientService.validateEncrypted(request.api_key, request.encrypted_data);
    const data = JSON.parse(decrypted_data);
    const pipe = new ValidationPipe({
      validateCustomDecorators: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });
    const { login } = await pipe.transform(data, { type: 'custom', metatype: LoginRequestDto });

    return this.clientService.login(login);
  }

  validate(request: ClientValidateRequest): Promise<ClientCreateResponse> {
    return this.clientService.validate(request.api_key);
  }

  validateEncrypted(request: ClientEncryptedRequest): Promise<ClientValidateEncryptedResponse> {
    return this.clientService.validateEncrypted(request.api_key, request.encrypted_data);
  }

  create(payload: ClientCreateRequest): Promise<ClientCreateResponse> {
    return this.clientService.create(payload);
  }
}
