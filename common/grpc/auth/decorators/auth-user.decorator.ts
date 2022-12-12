import { Metadata } from '@grpc/grpc-js';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const metadata = ctx.switchToRpc().getContext<Metadata>();

  const [user] = metadata.get('user');
  if (user) {
    return JSON.parse(user.toString());
  }

  return undefined;
});
