import { Metadata } from '@grpc/grpc-js';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import activeSessions from '../active-sessions.map';

export const GrpcSession = createParamDecorator((prop: string | undefined, ctx: ExecutionContext) => {
  const metadata = ctx.switchToRpc().getContext<Metadata>();
  const value = metadata.get('sessionId');
  if (value.length) {
    const sessionId = value[0].toString();
    const session = activeSessions.get(sessionId);
    if (prop) {
      return session.get(prop);
    }

    return session;
  }

  return null;
});

export const GrpcSessionUser = () => GrpcSession('user');
