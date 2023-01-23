import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from 'jsonwebtoken';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigInterface } from '~common/config/configuration';
import { SessionInterface } from '~common/session/interfaces/session.interface';
import { JwtAuthentication } from '../../interfaces/auth.interface';
import { SessionService } from '../../session.service';

@Injectable()
export class JwtSessionStrategy extends PassportStrategy(Strategy, 'jwt-session') {
  constructor(config: ConfigService<ConfigInterface>, private readonly session: SessionService<SessionInterface>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('auth.jwt.secret', { infer: true }),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtAuthentication> {
    const session = await this.session.get(payload.sub);

    if (session?.user) {
      return { user: session.user, sessionId: payload.sub, isAuthenticated: !!session.isAuthenticated };
    }

    throw new UnauthorizedException();
  }
}
