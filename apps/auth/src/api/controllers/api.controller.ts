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
import { LoginRequestDto } from '../dto/login.dto';
import { AuthApiService } from '../services/api.service';
import { ApiSocialsService } from '../services/api.socials.service';

@RpcController()
@AuthServiceControllerMethods()
export class AuthApiController implements AuthServiceController {
  constructor(private readonly authService: AuthApiService, private readonly socialAuthService: ApiSocialsService) {}

  registerStart(@Payload() request: RegisterStartRequest, @GrpcSession() session: SessionProxy): Promise<AuthData> {
    return this.authService.registerStart(request, session);
  }

  @GrpcSessionAuth({ allowUnauthorized: true })
  registerVerify(
    @Payload() request: TwoFactorCode,
    @GrpcSession() session: SessionProxy,
  ): Promise<TwoFactorVerificationResponse> {
    return this.authService.registerVerify(request, session);
  }

  @GrpcSessionAuth({ allowUnauthorized: true })
  registerFinish(
    @Payload() request: RegisterFinishRequest,
    @GrpcSession() session: SessionProxy<PreRegisteredSessionInterface>,
  ): Promise<User> {
    return this.authService.registerFinish(request, session);
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async login(@Payload() req: LoginRequestDto, @GrpcSession() session: SessionProxy) {
    const user = await this.authService.validateUser(req.login, req.password);
    if (!user) {
      throw new GrpcException(status.UNAUTHENTICATED, 'Unauthentcated', 401);
    }

    return this.authService.login(user, session);
  }

  loginSocials(@Payload() request: SocialsAuthRequest, @GrpcSession() session: SessionProxy): Promise<AuthData> {
    return this.socialAuthService.loginSocials(request, session);
  }

  @GrpcSessionAuth({ allowUnauthorized: true })
  async logout(_request: Empty, @GrpcSession() session: SessionProxy): Promise<SuccessResponse> {
    return this.authService.logout(session);
  }
}
