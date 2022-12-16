import { UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthServiceController, AuthServiceControllerMethods } from '~common/grpc/interfaces/auth';
import { LoginRequestDto } from './dto/login.dto';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { status } from '@grpc/grpc-js';

@RpcController()
@AuthServiceControllerMethods()
export class AuthController implements AuthServiceController {
  constructor(private readonly authService: AuthService) {}

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async login(req: LoginRequestDto) {
    const user = await this.authService.validateUser(req.login, req.password);
    if (!user) {
      throw new GrpcException(status.UNAUTHENTICATED, 'Unauthentcated', 401);
    }

    return this.authService.login(user);
  }
}
