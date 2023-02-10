import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload, VerifyOptions } from 'jsonwebtoken';
import util from 'node:util';
import { ExtractJwt } from 'passport-jwt';
import { ConfigInterface } from '~common/config/configuration';
import { SessionHost, SessionInterface, sessionProxyFactory, SessionService, WithSession } from '~common/session';

@Injectable()
export class JwtSessionMiddleware implements NestMiddleware {
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
      try {
        const res = next(err);

        return res;
      } finally {
        host?.isModified && host.save();
      }
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
