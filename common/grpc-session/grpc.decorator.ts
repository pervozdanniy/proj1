import { Metadata } from '@grpc/grpc-js';
import { applyDecorators, createParamDecorator, ExecutionContext, SetMetadata, UseGuards } from '@nestjs/common';
import { SessionMetadataOptions } from '~common/session';
import { GrpcSessionGuard } from './grpc.guard';
import { ActiveSessions } from './grpc.middleware';
import { GRPC_AUTH_METADATA } from './meta';

export const GrpcSession = createParamDecorator((prop: string | undefined, ctx: ExecutionContext) => {
  const session = ActiveSessions.get(ctx.getArgByIndex(2));
  if (session) {
    if (prop) {
      return session.get(prop);
    }

    return session;
  }

  return null;
});

export const GrpcSessionUser = () => GrpcSession('user');

export const GrpcSessionId = createParamDecorator((prop: never, ctx: ExecutionContext) => {
  const metadata = ctx.switchToRpc().getContext<Metadata>();
  const [sessionId] = metadata.get('sessionId');

  return sessionId?.toString();
});

export const GrpcSessionAuth = (options: SessionMetadataOptions = {}) =>
  applyDecorators(SetMetadata(GRPC_AUTH_METADATA, options), UseGuards(GrpcSessionGuard));
