import { status } from '@grpc/grpc-js';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { GrpcSession, GrpcSessionAuth, SessionProxy } from '~common/grpc-session';
import {
  AuthData,
  AuthServiceController,
  AuthServiceControllerMethods,
  RegisterSocialRequest,
  SocialsAuthRequest,
  TokenRequest,
  TokenValidateResponse,
} from '~common/grpc/interfaces/auth';
import { IdRequest, SuccessResponse, User } from '~common/grpc/interfaces/common';
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

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async login(@Payload() req: LoginRequestDto, @GrpcSession() session: SessionProxy) {
    const user = await this.authService.validateUser(req.login, req.password);
    if (!user) {
      throw new GrpcException(status.UNAUTHENTICATED, 'Unauthentcated', 401);
    }

    return this.authService.login(user, session);
  }

  refresh({ token }: TokenRequest): Promise<AuthData> {
    return this.authService.refresh(token);
  }

  async validate({ token }: TokenRequest): Promise<TokenValidateResponse> {
    const sessionId = await this.authService.validate(token);

    return { session_id: sessionId };
  }

  loginSocials(@Payload() request: SocialsAuthRequest, @GrpcSession() session: SessionProxy): Promise<AuthData> {
    return this.socialAuthService.loginSocials(request, session);
  }

  registerSocials(@Payload() request: RegisterSocialRequest, @GrpcSession() session: SessionProxy): Promise<AuthData> {
    return this.socialAuthService.registerSocials(request, session);
  }

  @GrpcSessionAuth({ allowUnauthorized: true })
  async logout(_request: Empty, @GrpcSession() session: SessionProxy): Promise<SuccessResponse> {
    return this.authService.logout(session);
  }

  closeAccount(@GrpcSession() session: SessionProxy): Promise<User> {
    return this.authService.closeAccount(session);
  }

  openAccount(@Payload() request: IdRequest): Promise<User> {
    return this.authService.openAccount(request);
  }
}
