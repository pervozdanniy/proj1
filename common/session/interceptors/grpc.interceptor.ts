import { Metadata } from '@grpc/grpc-js';
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import activeSessions from '../active-sessions.map';
import { sessionProxyFactory } from '../session-host';
import { SessionService } from '../session.service';

@Injectable()
export class GrpcSessionInterceptor implements NestInterceptor {
  private readonly logger = new Logger(GrpcSessionInterceptor.name);

  constructor(private readonly session: SessionService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const rpcContext = context.switchToRpc();
    const metadata = rpcContext.getContext<Metadata>();
    const value = metadata.get('sessionId');

    if (value.length) {
      const sessionId = value[0].toString();

      let sessionData: Record<string, any> | null;
      try {
        sessionData = await this.session.get(sessionId);
      } catch (error) {
        sessionData = null;
        this.logger.error('Session: fetch failed', error);
      }
      if (sessionData) {
        const host = sessionProxyFactory(this.session, sessionId, sessionData);
        activeSessions.set(sessionId, host);

        return next.handle().pipe(
          tap(() => {
            if (host.isModified) {
              host.save().catch((error) => this.logger.error('Session: persist failed', error.stack, { error }));
            }
            activeSessions.delete(sessionId);
          }),
        );
      }
    }

    return next.handle();
  }
}
