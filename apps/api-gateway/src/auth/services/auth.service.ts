import { HttpException, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { AuthData, AuthRequest, AuthServiceClient } from '~common/grpc/interfaces/auth';
import { SessionInterface, SessionService } from '~common/session';
import { is2FA } from '~common/session/helpers';
import { SocialsUserDto } from '~svc/api-gateway/src/auth/dto/socials-user.dto';

export class AuthService implements OnModuleInit {
  private authClient: AuthServiceClient;

  constructor(
    @InjectGrpc('auth') private readonly auth: ClientGrpc,
    private readonly session: SessionService<SessionInterface>,
  ) {}

  onModuleInit() {
    this.authClient = this.auth.getService('AuthService');
  }

  private async validateSession({ access_token, session_id }: AuthData) {
    const session = await this.session.get(session_id);
    if (is2FA(session)) {
      const methods = session.twoFactor.verify.map((v) => v.method);

      throw new HttpException({ message: '2FA required', access_token, methods }, 428);
    }
  }

  async login(credentials: AuthRequest) {
    const authData = await firstValueFrom(this.authClient.login(credentials));
    await this.validateSession(authData);

    return { access_token: authData.access_token };
  }

  async loginSocials(payload: SocialsUserDto) {
    const authData = await firstValueFrom(this.authClient.loginSocials(payload));
    await this.validateSession(authData);

    return { access_token: authData.access_token };
  }
}
