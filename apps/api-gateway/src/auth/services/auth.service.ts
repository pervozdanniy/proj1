import { Metadata } from '@grpc/grpc-js';
import { OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { AuthRequest, AuthServiceClient } from '~common/grpc/interfaces/auth';
import { IdRequest } from '~common/grpc/interfaces/common';
import { AuthResponseDto } from '../dto/auth.response.dto';
import { RegisterSocialsUserDto } from '../dto/register-socials-user.dto';
import { SocialsUserDto } from '../dto/socials-user.dto';
import { parseAuthResponse } from '../helpers/2fa';

export class AuthService implements OnModuleInit {
  private authClient: AuthServiceClient;

  constructor(@InjectGrpc('auth') private readonly auth: ClientGrpc) {}

  onModuleInit() {
    this.authClient = this.auth.getService('AuthService');
  }

  async login(credentials: AuthRequest): Promise<AuthResponseDto> {
    const resp = await firstValueFrom(this.authClient.login(credentials));

    return parseAuthResponse(resp);
  }

  async loginSocials(payload: SocialsUserDto): Promise<AuthResponseDto> {
    const resp = await firstValueFrom(this.authClient.loginSocials({ ...payload, social_id: payload.socialId }));

    return parseAuthResponse(resp);
  }

  async registerSocials(payload: RegisterSocialsUserDto): Promise<AuthResponseDto> {
    const resp = await firstValueFrom(this.authClient.registerSocials({ ...payload, social_id: payload.socialId }));

    return parseAuthResponse(resp);
  }

  closeAccount(sessionId: string) {
    const metadata = new Metadata();
    metadata.set('sessionId', sessionId);

    return firstValueFrom(this.authClient.closeAccount({}, metadata));
  }

  openAccount(payload: IdRequest) {
    return firstValueFrom(this.authClient.openAccount(payload));
  }

  validateToken(token: string) {
    return firstValueFrom(this.authClient.validate({ token }));
  }

  refreshToken(token: string) {
    return firstValueFrom(this.authClient.refresh({ token }));
  }
}
