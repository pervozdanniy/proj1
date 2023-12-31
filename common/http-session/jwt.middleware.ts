import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload, VerifyOptions } from 'jsonwebtoken';
import util from 'node:util';
import { ExtractJwt } from 'passport-jwt';
import { ConfigInterface } from '~common/config/configuration';
import { SessionInterface, SessionService, WithSession } from '~common/session';

@Injectable()
export class JwtSessionMiddleware implements NestMiddleware {
  constructor(
    private readonly config: ConfigService<ConfigInterface>,
    private readonly session: SessionService<SessionInterface>,
  ) {}

  use(req: WithSession<Request>, _res: Response, next: NextFunction) {
    const nextCb = (err?: any) => {
      try {
        return next(err ? new UnauthorizedException(err.message) : null);
      } finally {
        req.session?.save();
      }
    };

    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!token) {
      return this.session
        .generate()
        .then((proxy) => {
          req.session = proxy;
        })
        .then(nextCb, nextCb);
    }

    util
      .promisify<string, string, VerifyOptions, JwtPayload>(jwt.verify)(
        token,
        this.config.get('auth.jwt.secret', { infer: true }),
        {},
      )
      .then((payload) => payload.sub)
      .then((sessionId) => this.session.get(sessionId))
      .then((proxy) => {
        req.session = proxy;
      })
      .then(nextCb, nextCb);
  }
}
