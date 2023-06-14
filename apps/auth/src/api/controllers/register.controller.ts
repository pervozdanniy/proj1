import { Payload } from '@nestjs/microservices';
import { GrpcSession, GrpcSessionAuth } from '~common/grpc-session';
import {
  AuthData,
  CreateAgreementRequest,
  RegisterFinishRequest,
  RegisterServiceController,
  RegisterServiceControllerMethods,
  RegisterSimpleRequest,
  RegisterStartRequest,
  TwoFactorCode,
  TwoFactorVerificationResponse,
} from '~common/grpc/interfaces/auth';
import { User, UserAgreement } from '~common/grpc/interfaces/common';
import { RegisterSessionInterface, SessionProxy } from '~common/session';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { ApiRegisterService } from '../services/register.service';

@RpcController()
@RegisterServiceControllerMethods()
export class ApiRegisterController implements RegisterServiceController {
  constructor(private readonly registerService: ApiRegisterService) {}

  registerStart(@Payload() request: RegisterStartRequest, @GrpcSession() session: SessionProxy): Promise<AuthData> {
    return this.registerService.registerStart(request, session);
  }

  @GrpcSessionAuth({ allowUnauthorized: true })
  registerVerify(
    @Payload() request: TwoFactorCode,
    @GrpcSession() session: SessionProxy,
  ): Promise<TwoFactorVerificationResponse> {
    return this.registerService.registerVerify(request, session);
  }

  createAgreement(
    @Payload() request: CreateAgreementRequest,
    @GrpcSession() session: SessionProxy,
  ): Promise<UserAgreement> {
    return this.registerService.createAgreement(request, session);
  }

  @GrpcSessionAuth({ allowUnauthorized: true })
  registerFinish(
    @Payload() request: RegisterFinishRequest,
    @GrpcSession() session: SessionProxy<RegisterSessionInterface>,
  ): Promise<User> {
    return this.registerService.registerFinish(request, session);
  }

  registerSimple(request: RegisterSimpleRequest): Promise<User> {
    return this.registerService.simple(request);
  }
}
