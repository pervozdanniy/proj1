import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthRequest } from '~common/grpc/interfaces/auth';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { AuthService } from '~svc/auth/src/auth.service';
import { Metadata, status } from '@grpc/grpc-js';

@Injectable()
export class GrpcLocalGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rpcContext = context.switchToRpc();

    const { login, password } = rpcContext.getData<AuthRequest>();

    const user = await this.authService.validateUser(login, password);

    if (!user) {
      throw new GrpcException(status.UNAUTHENTICATED, 'Unauthorized', 401);
    }

    const metadata = rpcContext.getContext<Metadata>();
    metadata.set('user', JSON.stringify(user));

    return true;
  }
}
