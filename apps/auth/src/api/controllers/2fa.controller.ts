import { Metadata } from '@grpc/grpc-js';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import {
  TwoFactorEnabledMethodsResponse,
  TwoFactorRequireResponse,
  TwoFactorServiceController,
  TwoFactorServiceControllerMethods,
  TwoFactorVerificationResponse,
} from '~common/grpc/interfaces/auth';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import { Empty } from '~common/grpc/interfaces/google/protobuf/empty';
import { GrpcSessionAuth, SessionInterface, SessionService } from '~common/session';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { Auth2FAService } from '../../auth-2fa/2fa.service';
import { DisableRequestDto, EnableRequestDto, VerifyRequestDto } from '../dto/2fa.dto';

@RpcController()
@TwoFactorServiceControllerMethods()
export class TwoFactorController implements TwoFactorServiceController {
  constructor(private readonly auth2FA: Auth2FAService, private readonly session: SessionService<SessionInterface>) {}

  @GrpcSessionAuth({ allowUnauthorized: true })
  async require(_data: Empty, metadata?: Metadata): Promise<TwoFactorRequireResponse> {
    const [sessionId] = metadata.get('sessionId');
    const session = await this.session.get(sessionId.toString());

    try {
      const methods = await this.auth2FA.requireOrFail(sessionId.toString(), session);

      return { required: { methods } };
    } catch (error) {
      return { error: error.message };
    }
  }

  @GrpcSessionAuth()
  async list(_data: Empty, metadata: Metadata): Promise<TwoFactorEnabledMethodsResponse> {
    const [sessionId] = metadata.get('sessionId');
    const session = await this.session.get(sessionId.toString());

    const methods = await this.auth2FA.getEnabled(session.user.id);

    return { methods };
  }

  @GrpcSessionAuth()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async enable({ settings }: EnableRequestDto, metadata: Metadata): Promise<SuccessResponse> {
    const [sessionId] = metadata.get('sessionId');

    await this.auth2FA.enable(settings, sessionId.toString());

    return { success: true };
  }

  @GrpcSessionAuth()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async disable({ methods }: DisableRequestDto, metadata: Metadata): Promise<SuccessResponse> {
    const [sessionId] = metadata.get('sessionId');

    await this.auth2FA.disable(methods, sessionId.toString());

    return { success: true };
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  verify({ codes }: VerifyRequestDto, metadata: Metadata): Promise<TwoFactorVerificationResponse> {
    const [sessionId] = metadata.get('sessionId');

    return this.auth2FA.verify(codes, sessionId.toString());
  }
}
