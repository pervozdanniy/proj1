import { Metadata } from '@grpc/grpc-js';
import { applyDecorators, createParamDecorator, ExecutionContext, SetMetadata, UseGuards } from '@nestjs/common';
import activeSessions from '../active-sessions.map';
import { GRPC_AUTH_METADATA } from '../constants/meta';
import { GrpcSessionGuard } from '../guards/grpc.guard';
import { SessionMetadataOptions } from '../interfaces/session.interface';

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

export const GrpcSessionAuth = (options: SessionMetadataOptions = { allowUnverified: false }) =>
  applyDecorators(SetMetadata(GRPC_AUTH_METADATA, options), UseGuards(GrpcSessionGuard));
