import { Metadata } from '@grpc/grpc-js';
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuthorizedUser } from '~common/grpc/auth';
import { RedisStore } from '../redis.store';
import sessions from '../global';

@Injectable()
export class SessionInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SessionInterceptor.name);

  constructor(private readonly store: RedisStore) {}

  async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
    const rpcContext = context.switchToRpc();
    const metadata = rpcContext.getContext<Metadata>();
    const value = metadata.get('user');

    if (!value) {
      return next.handle();
    }

    const user: AuthorizedUser = JSON.parse(value[0].toString());

    let origSession: string | null;
    try {
      origSession = await this.store.get(user.id);
    } catch (error) {
      this.logger.error('Session: fetch failed', error);
    }

    sessions.set(user.id, origSession ? JSON.parse(origSession) : {});

    return next.handle().pipe(
      tap(() => {
        const session = JSON.stringify(sessions.get(user.id));
        if (session !== origSession) {
          this.store.set(user.id, session).catch((error) => this.logger.error('Session: persist failed', error));
        }
      }),
    );
  }
}
