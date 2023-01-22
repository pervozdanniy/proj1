import { Metadata, status } from '@grpc/grpc-js';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import {
  AuthData,
  AuthServiceController,
  AuthServiceControllerMethods,
  SocialsAuthRequest,
  TwoFactorVerificationRequest,
} from '~common/grpc/interfaces/auth';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { ApiSocialsService } from '~svc/auth/src/api/services/api.socials.service';
import { LoginRequestDto } from '../dto/login.dto';
import { AuthApiService } from '../services/api.service';

@RpcController()
@AuthServiceControllerMethods()
export class AuthApiController implements AuthServiceController {
  constructor(private readonly authService: AuthApiService, private readonly socialAuthService: ApiSocialsService) {}

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

  verify2Fa({ codes }: TwoFactorVerificationRequest, metadata?: Metadata) {
    const [sessionId] = metadata.get('sessionId');

    return this.authService.validate2FA(codes, sessionId.toString());
  }
}
