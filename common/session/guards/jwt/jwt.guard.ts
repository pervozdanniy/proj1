import { ExecutionContext, Injectable, PreconditionFailedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthentication, SessionMetadataOptions } from '~common/session';
import { JWT_AUTH_METADATA } from '~common/session/constants/meta';

@Injectable()
export class JwtSessionGuard extends AuthGuard('jwt-session') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  handleRequest(err: any, user: JwtAuthentication, info: any, context: ExecutionContext, status?: any) {
    const metadata = this.reflector.get<SessionMetadataOptions>(JWT_AUTH_METADATA, context.getHandler());
    if (!metadata?.allowUnverified && !user.isAuthenticated) {
      err = new PreconditionFailedException('2FA is not completed');
      user = undefined;
    }

    return super.handleRequest(err, user, info, context, status);
  }
}
