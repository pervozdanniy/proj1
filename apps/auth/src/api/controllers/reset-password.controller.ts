import { UsePipes, ValidationPipe } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { GrpcSession, GrpcSessionAuth } from '~common/grpc-session';
import {
  AuthData,
  ChangeOldPasswordRequest,
  ChangePasswordStartRequest,
  ResetPasswordFinishRequest,
  ResetPasswordServiceController,
  ResetPasswordServiceControllerMethods,
  TwoFactorCode,
  TwoFactorVerificationResponse,
  Verification,
} from '~common/grpc/interfaces/auth';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import { SessionProxy } from '~common/session';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ApiResetPasswordService } from '../services/reset-password.service';

@RpcController()
@ResetPasswordServiceControllerMethods()
export class ApiResetPasswordController implements ResetPasswordServiceController {
  constructor(private readonly resetPasswordService: ApiResetPasswordService) {}

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  resetPasswordStart(@Payload() request: ResetPasswordDto, @GrpcSession() session: SessionProxy): Promise<AuthData> {
    return this.resetPasswordService.resetPasswordStart(request, session);
  }

  @GrpcSessionAuth({ allowUnauthorized: true })
  resetPasswordVerify(
    @Payload() request: TwoFactorCode,
    @GrpcSession() session: SessionProxy,
  ): Promise<TwoFactorVerificationResponse> {
    return this.resetPasswordService.resetPasswordVerify(request, session);
  }

  @GrpcSessionAuth()
  async resetPasswordFinish(
    @Payload() request: ResetPasswordFinishRequest,
    @GrpcSession() session: SessionProxy,
  ): Promise<SuccessResponse> {
    return this.resetPasswordService.resetPasswordFinish(request.password, session);
  }

  changeOldPassword(
    @Payload() request: ChangeOldPasswordRequest,
    @GrpcSession() session: SessionProxy,
  ): Promise<SuccessResponse> {
    return this.resetPasswordService.changeOldPassword(request, session);
  }

  changePasswordStart(
    @Payload() request: ChangePasswordStartRequest,
    @GrpcSession() session: SessionProxy,
  ): Promise<Verification> {
    return this.resetPasswordService.changePasswordStart(request, session);
  }
}
