import { UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthorizedUser, AuthServiceController, AuthServiceControllerMethods } from '~common/grpc/interfaces/auth';
import { LoginRequestDto } from './dto/login.dto';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { AuthUser, GrpcJwtGuard } from '~common/grpc/auth';
import { SessionInterceptor, GrpcSession } from '~common/grpc/session';

@RpcController()
@AuthServiceControllerMethods()
export class AuthController implements AuthServiceController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(GrpcJwtGuard)
  @UseInterceptors(SessionInterceptor)
  me(@AuthUser() user: AuthorizedUser, @GrpcSession() session: Record<string, any>) {
    session.suka1 = 'wewew';

    return this.authService.findUser(user.id);
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async login(req: LoginRequestDto) {
    const user = await this.authService.validateUser(req.login, req.password);

    return this.authService.login(user);
  }
}
