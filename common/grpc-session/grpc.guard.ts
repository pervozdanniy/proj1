import { status } from '@grpc/grpc-js';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SessionMetadataOptions, SessionService } from '~common/session';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { ActiveSessions } from './grpc.middleware';
import { GRPC_AUTH_METADATA } from './meta';

@Injectable()
export class GrpcSessionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly session: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const session = ActiveSessions.get(context.getArgByIndex(2));

    if (session) {
      const options = this.reflector.get<SessionMetadataOptions>(GRPC_AUTH_METADATA, context.getHandler());
      if (options.allowUnauthorized || session?.user) {
        return true;
      }
    }

    throw new GrpcException(status.UNAUTHENTICATED, 'Unauthorized');
  }
}
