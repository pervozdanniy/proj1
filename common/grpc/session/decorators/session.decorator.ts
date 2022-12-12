import { Metadata } from '@grpc/grpc-js';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthorizedUser } from '~common/grpc/interfaces/auth';
import sessions from '../global';

export const GrpcSession = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const metadata = ctx.switchToRpc().getContext<Metadata>();
  const value = metadata.get('user');
  if (value) {
    const user: AuthorizedUser = JSON.parse(value[0].toString());

    return sessions.get(user.id);
  }

  return null;
});
