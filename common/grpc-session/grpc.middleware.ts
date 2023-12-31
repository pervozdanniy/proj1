import { GrpcInteceptorContext } from '@grpc/grpc-js';
import { ServerSurfaceCall } from '@grpc/grpc-js/build/src/server-call';
import { Injectable, Logger } from '@nestjs/common';
import '~common/grpc-session/utils/interceptors';
import { GrpcServerInterceptor } from '~common/grpc-session/utils/interceptors';
import { SessionInterface, SessionProxy, SessionService } from '~common/session';

export const ActiveSessions = new WeakMap<ServerSurfaceCall, SessionProxy<SessionInterface>>();

@Injectable()
export class GrpcSessionMiddleware implements GrpcServerInterceptor {
  private readonly logger = new Logger(GrpcSessionMiddleware.name);

  constructor(private readonly session: SessionService<SessionInterface>) {}

  async use({ metadata, call }: GrpcInteceptorContext<any>, next: (err?: any) => Promise<void>) {
    let proxy: SessionProxy;

    const value = metadata.get('sessionId');
    if (value.length) {
      const sessionId = value[0].toString();

      try {
        proxy = await this.session.get(sessionId.toString());
      } catch (error) {
        this.logger.error('Session: fetch failed', error.stack, { sessionId, error });
      }
    }

    if (!proxy) {
      proxy = await this.session.generate();
    }
    ActiveSessions.set(call, proxy);

    return next().finally(() => {
      proxy.save().catch((error) => this.logger.error('Session: persist failed', error.stack, { error }));
    });

    return next();
  }
}
