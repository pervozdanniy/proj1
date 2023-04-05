import { Metadata } from '@grpc/grpc-js';
import { OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { AuthRequest, AuthServiceClient } from '~common/grpc/interfaces/auth';
import { IdRequest } from '~common/grpc/interfaces/common';
import { RegisterSocialsUserDto } from '../dto/register-socials-user.dto';
import { SocialsUserDto } from '../dto/socials-user.dto';
import { TwoFactorService } from './2fa.service';

export class AuthService implements OnModuleInit {
  private authClient: AuthServiceClient;

  constructor(@InjectGrpc('auth') private readonly auth: ClientGrpc, private readonly auth2FA: TwoFactorService) {}

  onModuleInit() {
    this.authClient = this.auth.getService('AuthService');
  }

  async login(credentials: AuthRequest) {
    const resp = await firstValueFrom(this.authClient.login(credentials));

    return this.auth2FA.validateAuthResponse(resp);
  }

  async loginSocials(payload: SocialsUserDto) {
    const resp = await firstValueFrom(this.authClient.loginSocials(payload));

    return this.auth2FA.validateAuthResponse(resp);
  }

  async registerSocials(payload: RegisterSocialsUserDto) {
    const resp = await firstValueFrom(this.authClient.registerSocials(payload));

    return this.auth2FA.validateAuthResponse(resp);
  }

  async closeAccount(sessionId: string) {
    const metadata = new Metadata();
    metadata.set('sessionId', sessionId);

    return this.authClient.closeAccount({}, metadata);
  }

  async openAccount(payload: IdRequest) {
    return this.authClient.openAccount(payload);
  }
}
