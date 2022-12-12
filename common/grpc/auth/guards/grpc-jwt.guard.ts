import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Metadata, status } from '@grpc/grpc-js';
import { AuthorizedUser, JwtPayload } from '../interfaces/auth.interface';
import { JwtService } from '@nestjs/jwt';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';

@Injectable()
export class GrpcJwtGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rpcContext = context.switchToRpc();
    const metadata = rpcContext.getContext<Metadata>();
    const [token] = metadata.get('authorization');
    if (!token) {
      throw new GrpcException(status.UNAUTHENTICATED, 'Unauthorized', 401);
    }

    const payload = await this.jwt.verifyAsync<JwtPayload>(token.toString());

    let user: AuthorizedUser;
    try {
      user = await this.validate(payload);
    } catch (error) {
      throw new GrpcException(status.UNAUTHENTICATED, error.messge ?? 'Unauthenticated', 401);
    }
    metadata.set('user', JSON.stringify(user));

    return true;
  }

  async validate(payload: JwtPayload): Promise<AuthorizedUser> {
    return { id: Number(payload.sub), username: payload.username };
  }
}
