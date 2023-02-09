import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { JWT_AUTH_METADATA } from '../constants/meta';
import { SessionInterface, SessionMetadataOptions, WithSession } from '../interfaces/session.interface';

@Injectable()
export class JwtSessionGuard implements CanActivate {
  constructor(protected readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<WithSession<Request>>();

    if (!req.session) {
      throw new UnauthorizedException("User's session is missing or malformed");
    }

    return this.validateSession(req.session, context);
  }

  protected async validateSession(session: SessionInterface, context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.get<SessionMetadataOptions>(JWT_AUTH_METADATA, context.getHandler());
    if (!options.allowUnauthorized && !session.user) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
