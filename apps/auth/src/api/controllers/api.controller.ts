import { Metadata, status } from '@grpc/grpc-js';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import {
  AuthData,
  AuthServiceController,
  AuthServiceControllerMethods,
  PreRegisterRequest,
  SocialsAuthRequest,
} from '~common/grpc/interfaces/auth';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import { Empty } from '~common/grpc/interfaces/google/protobuf/empty';
import { GrpcSessionAuth } from '~common/session';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { ApiSocialsService } from '~svc/auth/src/api/services/api.socials.service';
import { LoginRequestDto } from '../dto/login.dto';
import { AuthApiService } from '../services/api.service';

@RpcController()
@AuthServiceControllerMethods()
export class AuthApiController implements AuthServiceController {
  constructor(private readonly authService: AuthApiService, private readonly socialAuthService: ApiSocialsService) {}

  preRegister(request: PreRegisterRequest): Promise<AuthData> {
    return this.authService.preRegister(request);
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async login(req: LoginRequestDto) {
    const user = await this.authService.validateUser(req.login, req.password);
    if (!user) {
      throw new GrpcException(status.UNAUTHENTICATED, 'Unauthentcated', 401);
    }

    return this.authService.login(user);
  }

  loginSocials(request: SocialsAuthRequest): Promise<AuthData> {
    return this.socialAuthService.loginSocials(request);
  }

  @GrpcSessionAuth({ allowUnauthorized: true })
  async logout(_request: Empty, metadata: Metadata): Promise<SuccessResponse> {
    const [sessionId] = metadata.get('sessionId');

    return this.authService.logout(sessionId.toString());
  }
}
