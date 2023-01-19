import { Injectable, PreconditionFailedException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from 'jsonwebtoken';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigInterface } from '~common/config/configuration';
import { is2FA, isAuthenticated } from '~common/session/helpers';
import { JwtAuthentication } from '../../interfaces/auth.interface';
import { SessionService } from '../../session.service';

@Injectable()
export class JwtSessionStrategy extends PassportStrategy(Strategy, 'jwt-session') {
  constructor(config: ConfigService<ConfigInterface>, private readonly session: SessionService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('auth.jwt.secret', { infer: true }),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtAuthentication> {
    const session = await this.session.get(payload.sub);
    if (!session) {
      throw new UnauthorizedException();
    }
    if (is2FA(session)) {
      throw new PreconditionFailedException('2FA is not completed');
    }
    if (isAuthenticated(session)) {
      return { user: session.user, sessionId: payload.sub };
    }

    throw new UnauthorizedException();
  }
}
