import { Metadata, status } from '@grpc/grpc-js';
import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { GRPC_AUTH_METADATA } from '../constants/meta';
import { SessionMetadataOptions } from '../interfaces/session.interface';
import { SessionService } from '../session.service';

@Injectable()
export class GrpcSessionGuard implements CanActivate {
  private readonly logger = new Logger(GrpcSessionGuard.name);

  constructor(private readonly reflector: Reflector, private readonly session: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rpcContext = context.switchToRpc();
    const metadata = rpcContext.getContext<Metadata>();
    const value = metadata.get('sessionId');

    if (value.length) {
      const sessionId = value[0].toString();

      let sessionData: Record<string, any> | null;
      try {
        sessionData = await this.session.get(sessionId);
      } catch (error) {
        this.logger.error('Session: fetch failed', error);
      }

      const options = this.reflector.get<SessionMetadataOptions>(GRPC_AUTH_METADATA, context.getHandler());

      if (options.allowUnauthorized || sessionData?.user) {
        return true;
      }
    }

    throw new GrpcException(status.UNAUTHENTICATED, 'Unauthorized');
  }
}
