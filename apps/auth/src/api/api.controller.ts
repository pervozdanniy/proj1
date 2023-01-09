import { status } from '@grpc/grpc-js';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import {
  AuthData,
  AuthServiceController,
  AuthServiceControllerMethods,
  GoogleAuthRequest,
} from '~common/grpc/interfaces/auth';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { ApiGoogleService } from '~svc/auth/src/api/api.google.service';
import { AuthApiService } from './api.service';
import { LoginRequestDto } from './dto/login.dto';

@RpcController()
@AuthServiceControllerMethods()
export class AuthApiController implements AuthServiceController {
  constructor(private readonly authService: AuthApiService, private readonly googleAuthService: ApiGoogleService) {}

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async login(req: LoginRequestDto) {
    const user = await this.authService.validateUser(req.login, req.password);
    if (!user) {
      throw new GrpcException(status.UNAUTHENTICATED, 'Unauthentcated', 401);
    }

    return this.authService.login(user);
  }

  loginGoogle(request: GoogleAuthRequest): Promise<AuthData> {
    return this.googleAuthService.loginGoogle(request);
  }
}
