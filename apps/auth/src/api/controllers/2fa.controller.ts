import { UsePipes, ValidationPipe } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { GrpcSession, GrpcSessionAuth, SessionProxy } from '~common/grpc-session';
import {
  TwoFactorEnabledMethodsResponse,
  TwoFactorRequireResponse,
  TwoFactorServiceController,
  TwoFactorServiceControllerMethods,
  TwoFactorVerificationResponse,
} from '~common/grpc/interfaces/auth';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import { Empty } from '~common/grpc/interfaces/google/protobuf/empty';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { Auth2FAService } from '../../auth-2fa/2fa.service';
import {
  DisableRequestDto,
  EnableRequestDto,
  ResendRequestDto,
  TwoFactorCodeDto,
  VerifyRequestDto,
} from '../dto/2fa.dto';

@RpcController()
@TwoFactorServiceControllerMethods()
export class TwoFactorController implements TwoFactorServiceController {
  constructor(private readonly auth2FA: Auth2FAService) {}
  async resend(
    @Payload() { method }: ResendRequestDto,
    @GrpcSession() session: SessionProxy,
  ): Promise<SuccessResponse> {
    try {
      await this.auth2FA.resend(method, session);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @GrpcSessionAuth({ allowUnauthorized: true })
  async require(_data: Empty, @GrpcSession() session: SessionProxy): Promise<TwoFactorRequireResponse> {
    try {
      const methods = await this.auth2FA.requireOrFail(session);

      return { required: { methods } };
    } catch (error) {
      return { error: error.message };
    }
  }

  @GrpcSessionAuth()
  async list(_data: Empty, @GrpcSession() session: SessionProxy): Promise<TwoFactorEnabledMethodsResponse> {
    const methods = await this.auth2FA.getEnabled(session.user.id);

    return { methods };
  }

  @GrpcSessionAuth()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async enable(
    @Payload() { settings }: EnableRequestDto,
    @GrpcSession() session: SessionProxy,
  ): Promise<SuccessResponse> {
    await this.auth2FA.enable(settings, session);

    return { success: true };
  }

  @GrpcSessionAuth()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async disable(
    @Payload() { methods }: DisableRequestDto,
    @GrpcSession() session: SessionProxy,
  ): Promise<SuccessResponse> {
    await this.auth2FA.disable(methods, session);

    return { success: true };
  }

  @GrpcSessionAuth({ allowUnauthorized: true })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  verify(
    @Payload() data: VerifyRequestDto,
    @GrpcSession() session: SessionProxy,
  ): Promise<TwoFactorVerificationResponse> {
    return this.auth2FA.verify(data.codes, session);
  }

  @GrpcSessionAuth({ allowUnauthorized: true })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  verifyOne(
    @Payload() request: TwoFactorCodeDto,
    @GrpcSession() session: SessionProxy,
  ): Promise<TwoFactorVerificationResponse> {
    return this.auth2FA.verifyOne(request, session);
  }
}
