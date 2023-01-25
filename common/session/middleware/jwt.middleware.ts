import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload, VerifyOptions } from 'jsonwebtoken';
import util from 'node:util';
import { ExtractJwt } from 'passport-jwt';
import { ConfigInterface } from '~common/config/configuration';
import { SessionInterface, WithSession } from '../interfaces/session.interface';
import { SessionHost, sessionProxyFactory } from '../session-host';
import { SessionService } from '../session.service';

@Injectable()
export class JwtSessionMiddleware implements NestMiddleware {
  private logger = new Logger(JwtSessionMiddleware.name);

  constructor(
    private readonly config: ConfigService<ConfigInterface>,
    private readonly session: SessionService<SessionInterface>,
  ) {}

  use(req: WithSession<Request>, _res: Response, next: NextFunction) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!token) {
      return next();
    }

    let host: SessionHost<SessionInterface> & SessionInterface;
    const nextCb = (err?: any) => {
      const res = next(err);
      if (host?.isModified) {
        host
          .save()
          .catch((error) =>
            this.logger.error('Session: persist failed', error.stack, { error, sessionId: host.sessionId }),
          );
      }

      return res;
    };
    util
      .promisify<string, string, VerifyOptions, JwtPayload>(jwt.verify)(
        token,
        this.config.get('auth.jwt.secret', { infer: true }),
        {},
      )
      .then((payload) => payload.sub)
      .then((sessionId) => this.session.get(sessionId).then((session) => ({ sessionId, session })))
      .then(({ sessionId, session }) => {
        if (session) {
          host = sessionProxyFactory(this.session, sessionId, session);
          req.session = host;
        }
      })
      .then(nextCb)
      .catch(nextCb);
  }
}
