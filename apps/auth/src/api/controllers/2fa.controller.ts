import { Metadata } from '@grpc/grpc-js';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import {
  TwoFactorEnabledMethodsResponse,
  TwoFactorServiceController,
  TwoFactorServiceControllerMethods,
  TwoFactorVerificationResponse,
} from '~common/grpc/interfaces/auth';
import { IdRequest, SuccessResponse } from '~common/grpc/interfaces/common';
import { GrpcSessionAuth } from '~common/session';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { DisableRequestDto, EnableRequestDto, VerifyRequestDto } from '../dto/2fa.dto';
import { TwoFactorService } from '../services/2fa.service';

@RpcController()
@TwoFactorServiceControllerMethods()
export class TwoFactorController implements TwoFactorServiceController {
  constructor(private readonly twoFactorService: TwoFactorService) {}

  async list({ id }: IdRequest): Promise<TwoFactorEnabledMethodsResponse> {
    const methods = await this.twoFactorService.getEnabled(id);

    return { methods };
  }

  @GrpcSessionAuth({ allowUnverified: true })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async enable({ settings }: EnableRequestDto, metadata?: Metadata): Promise<SuccessResponse> {
    const [sessionId] = metadata.get('sessionId');

    await this.twoFactorService.enable(settings, sessionId.toString());

    return { success: true };
  }

  @GrpcSessionAuth({ allowUnverified: true })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async disable({ methods }: DisableRequestDto, metadata?: Metadata): Promise<SuccessResponse> {
    const [sessionId] = metadata.get('sessionId');

    await this.twoFactorService.disable(methods, sessionId.toString());

    return { success: true };
  }

  @GrpcSessionAuth({ allowUnverified: true })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  verify({ codes }: VerifyRequestDto, metadata?: Metadata): Promise<TwoFactorVerificationResponse> {
    const [sessionId] = metadata.get('sessionId');

    return this.twoFactorService.verify(codes, sessionId.toString());
  }
}
