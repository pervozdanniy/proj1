import { Metadata, ServerUnaryCall } from '@grpc/grpc-js';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { GrpcSession, GrpcSessionAuth, GrpcSessionId, SessionInterface, SessionProxy } from '~common/grpc-session';
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
import { DisableRequestDto, EnableRequestDto, TwoFactorCodeDto, VerifyRequestDto } from '../dto/2fa.dto';

@RpcController()
@TwoFactorServiceControllerMethods()
export class TwoFactorController implements TwoFactorServiceController {
  constructor(private readonly auth2FA: Auth2FAService) {}

  @GrpcSessionAuth({ allowUnauthorized: true })
  async require(
    _data: Empty,
    _metadata,
    @GrpcSession() session?: SessionProxy<SessionInterface>,
  ): Promise<TwoFactorRequireResponse> {
    try {
      const methods = await this.auth2FA.requireOrFail(session.sessionId, session);

      return { required: { methods } };
    } catch (error) {
      return { error: error.message };
    }
  }

  @GrpcSessionAuth()
  async list(
    _data: Empty,
    _metadata,
    @GrpcSession() session?: SessionInterface,
  ): Promise<TwoFactorEnabledMethodsResponse> {
    const methods = await this.auth2FA.getEnabled(session.user.id);

    return { methods };
  }

  @GrpcSessionAuth()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async enable(
    @Payload() { settings }: EnableRequestDto,
    _metadata,
    @GrpcSessionId() sessionId?: string,
  ): Promise<SuccessResponse> {
    await this.auth2FA.enable(settings, sessionId);

    return { success: true };
  }

  @GrpcSessionAuth()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async disable(
    @Payload() { methods }: DisableRequestDto,
    _metadata,
    @GrpcSessionId() sessionId?: string,
  ): Promise<SuccessResponse> {
    await this.auth2FA.disable(methods, sessionId);

    return { success: true };
  }

  @GrpcSessionAuth({ allowUnauthorized: true })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  verify(
    @Payload() data: VerifyRequestDto,
    _metadata,
    @GrpcSessionId() sessionId?: string,
  ): Promise<TwoFactorVerificationResponse> {
    return this.auth2FA.verify(data.codes, sessionId);
  }

  @GrpcSessionAuth({ allowUnauthorized: true })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  verifyOne(
    @Payload() request: TwoFactorCodeDto,
    _metadata,
    @GrpcSessionId() sessionId?: string,
  ): Promise<TwoFactorVerificationResponse> {
    return this.auth2FA.verifyOne(request, sessionId);
  }
}
