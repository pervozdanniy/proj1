import { Metadata, status } from '@grpc/grpc-js';
import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { SessionService } from '../session.service';

@Injectable()
export class GrpcSessionGuard implements CanActivate {
  private readonly logger = new Logger(GrpcSessionGuard.name);

  constructor(private readonly session: SessionService) {}

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

      if (sessionData?.user) {
        return true;
      }
    }

    throw new GrpcException(status.UNAUTHENTICATED, 'Unauthorized');
  }
}
