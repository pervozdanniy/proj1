import {
  CanActivate,
  ExecutionContext,
  Injectable,
  PreconditionFailedException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { JWT_AUTH_METADATA } from '../constants/meta';
import { is2FA } from '../helpers';
import { SessionMetadataOptions, WithSession } from '../interfaces/session.interface';

@Injectable()
export class JwtSessionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<WithSession<Request>>();

    if (!req.session?.user) {
      throw new UnauthorizedException();
    }

    const metadata = this.reflector.get<SessionMetadataOptions>(JWT_AUTH_METADATA, context.getHandler());
    if (!metadata.allowUnverified && is2FA(req.session)) {
      throw new PreconditionFailedException('2FA is not completed');
    }

    return true;
  }
}
