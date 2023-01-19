import { Metadata } from '@grpc/grpc-js';
import { HttpException, OnModuleInit, PreconditionFailedException, UnauthorizedException } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { AuthData, AuthRequest, AuthServiceClient } from '~common/grpc/interfaces/auth';
import { SessionService } from '~common/session';
import { is2FA, isAuthenticated } from '~common/session/helpers';
import { SocialsUserDto } from '~svc/api-gateway/src/auth/dto/socials-user.dto';
import { TwoFactorRequestDto } from './dto/2fa.request.dto';

export class AuthService implements OnModuleInit {
  private authClient: AuthServiceClient;

  constructor(@InjectGrpc('auth') private readonly auth: ClientGrpc, private readonly session: SessionService) {}

  onModuleInit() {
    this.authClient = this.auth.getService('AuthService');
  }

  private async validateSession({ access_token, session_id }: AuthData) {
    const session = await this.session.get(session_id);
    if (isAuthenticated(session)) return;
    if (is2FA(session)) {
      const methods = session.verify.codes.map((v) => v.method);

      throw new HttpException({ statusCode: 428, message: '2FA required', access_token, methods }, 428);
    }

    throw new UnauthorizedException();
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

  async verify2Fa(payload: TwoFactorRequestDto, sessionId: string) {
    const metadata = new Metadata();
    metadata.set('sessionId', sessionId);

    const { valid, reason } = await firstValueFrom(this.authClient.verify2Fa(payload, metadata));

    if (!valid) throw new PreconditionFailedException(reason);

    return { success: true };
  }
}
