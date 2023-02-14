import { status } from '@grpc/grpc-js';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { PreRegisteredSessionInterface } from '~common/constants/auth';
import { GrpcSession, GrpcSessionAuth, SessionProxy } from '~common/grpc-session';
import {
  AuthData,
  AuthServiceController,
  AuthServiceControllerMethods,
  RegisterFinishRequest,
  RegisterStartRequest,
  SocialsAuthRequest,
  TwoFactorCode,
  TwoFactorVerificationResponse,
} from '~common/grpc/interfaces/auth';
import { SuccessResponse, User } from '~common/grpc/interfaces/common';
import { Empty } from '~common/grpc/interfaces/google/protobuf/empty';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { ApiSocialsService } from '~svc/auth/src/api/services/api.socials.service';
import { LoginRequestDto } from '../dto/login.dto';
import { AuthApiService } from '../services/api.service';

@RpcController()
@AuthServiceControllerMethods()
export class AuthApiController implements AuthServiceController {
  constructor(private readonly authService: AuthApiService, private readonly socialAuthService: ApiSocialsService) {}

  registerStart(request: RegisterStartRequest): Promise<AuthData> {
    return this.authService.registerStart(request);
  }

  @GrpcSessionAuth({ allowUnauthorized: true })
  registerVerify(
    @Payload() request: TwoFactorCode,
    _metadata,
    @GrpcSession() session?: SessionProxy,
  ): Promise<TwoFactorVerificationResponse> {
    return this.authService.registerVerify(request, session);
  }

  @GrpcSessionAuth({ allowUnauthorized: true })
  registerFinish(
    @Payload() request: RegisterFinishRequest,
    _metadata,
    @GrpcSession() session?: SessionProxy<PreRegisteredSessionInterface>,
  ): Promise<User> {
    return this.authService.registerFinish(request, session);
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
  async logout(_request: Empty, _metadata, @GrpcSession() session?: SessionProxy): Promise<SuccessResponse> {
    return this.authService.logout(session);
  }
}
