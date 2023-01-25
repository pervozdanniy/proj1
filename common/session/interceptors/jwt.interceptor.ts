import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
  PreconditionFailedException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { finalize, Observable } from 'rxjs';
import { JWT_AUTH_METADATA } from '../constants/meta';
import { is2FA } from '../helpers';
import { SessionInterface, SessionMetadataOptions, WithSession } from '../interfaces/session.interface';
import { sessionProxyFactory } from '../session-host';
import { SessionService } from '../session.service';

@Injectable()
export class JwtSessionInterceptor implements NestInterceptor {
  private readonly logger = new Logger(JwtSessionInterceptor.name);

  constructor(private readonly reflector: Reflector, private readonly session: SessionService<SessionInterface>) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest<WithSession<Request>>();
    const { sessionId } = req.user as { sessionId: string };

    const session = await this.session.get(sessionId);
    if (!session?.user) {
      throw new UnauthorizedException();
    }
    const metadata = this.reflector.get<SessionMetadataOptions>(JWT_AUTH_METADATA, context.getHandler());
    if (!metadata.allowUnverified && is2FA(session)) {
      throw new PreconditionFailedException('2FA is not completed');
    }

    const host = sessionProxyFactory(this.session, sessionId, session);

    req.session = host;

    return next.handle().pipe(
      finalize(() => {
        if (host.isModified) {
          host.save().catch((error) => this.logger.error('Session: persist failed', error.stack, { error }));
        }
      }),
    );
  }
}
