import { GrpcInteceptorContext } from '@grpc/grpc-js';
import { ServerSurfaceCall } from '@grpc/grpc-js/build/src/server-call';
import { Injectable, Logger } from '@nestjs/common';
import '~common/grpc-session/utils/interceptors';
import { GrpcServerInterceptor } from '~common/grpc-session/utils/interceptors';
import { SessionInterface, SessionProxy, sessionProxyFactory, SessionService } from '~common/session';

export const ActiveSessions = new WeakMap<ServerSurfaceCall, SessionProxy<SessionInterface>>();

@Injectable()
export class GrpcSessionMiddleware implements GrpcServerInterceptor {
  private readonly logger = new Logger(GrpcSessionMiddleware.name);

  constructor(private readonly session: SessionService<SessionInterface>) {}

  async use({ metadata, call }: GrpcInteceptorContext<any>, next: (err?: any) => Promise<void>) {
    const value = metadata.get('sessionId');

    if (value.length) {
      const sessionId = value[0].toString();
      let session: SessionInterface;
      try {
        session = await this.session.get(sessionId.toString());
      } catch (error) {
        this.logger.error('Session: fetch failed', error.stack, { sessionId, error });
      }

      if (session) {
        const proxy = sessionProxyFactory(this.session, sessionId, session);
        ActiveSessions.set(call, proxy);

        return next().finally(() => {
          proxy.isModified &&
            proxy.save().catch((error) => this.logger.error('Session: persist failed', error.stack, { error }));
        });
      }
    }

    return next();
  }
}
