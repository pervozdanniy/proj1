import { OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { AuthRequest, AuthServiceClient } from '~common/grpc/interfaces/auth';
import { SocialsUserDto } from '~svc/api-gateway/src/api/auth/dto/socials-user.dto';
import { TwoFactorService } from './2fa.service';

export class AuthService implements OnModuleInit {
  private authClient: AuthServiceClient;

  constructor(@InjectGrpc('auth') private readonly auth: ClientGrpc, private readonly twoFactor: TwoFactorService) {}

  onModuleInit() {
    this.authClient = this.auth.getService('AuthService');
  }

  async login(credentials: AuthRequest) {
    const authData = await firstValueFrom(this.authClient.login(credentials));

    return this.twoFactor.validateAuthResponse(authData);
  }

  async loginSocials(payload: SocialsUserDto) {
    const authData = await firstValueFrom(this.authClient.loginSocials(payload));

    return this.twoFactor.validateAuthResponse(authData);
  }
}
