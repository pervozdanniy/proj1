import { Metadata } from '@grpc/grpc-js';
import { HttpException, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { TwoFactorMethod } from '~common/constants/auth';
import { InjectGrpc } from '~common/grpc/helpers';
import { AuthData, TwoFactorServiceClient } from '~common/grpc/interfaces/auth';
import { TwoFactorEnableRequestDto, TwoFactorVerifyRequestDto } from '../dto/2fa.request.dto';

@Injectable()
export class TwoFactorService implements OnModuleInit {
  private authClient: TwoFactorServiceClient;

  constructor(@InjectGrpc('auth') private readonly auth: ClientGrpc) {}

  onModuleInit() {
    this.authClient = this.auth.getService('TwoFactorService');
  }

  list(sessionId: string) {
    const metadata = new Metadata();
    metadata.set('sessionId', sessionId);

    return firstValueFrom(this.authClient.list({}, metadata));
  }

  require(sessionId: string) {
    const metadata = new Metadata();
    metadata.set('sessionId', sessionId);

    return firstValueFrom(this.authClient.require({}, metadata));
  }

  enable(settings: TwoFactorEnableRequestDto, sessionId: string) {
    const metadata = new Metadata();
    metadata.set('sessionId', sessionId);

    return firstValueFrom(this.authClient.enable({ settings }, metadata));
  }

  disable(methods: TwoFactorMethod[] | undefined, sessionId: string) {
    const metadata = new Metadata();
    metadata.set('sessionId', sessionId);

    return firstValueFrom(this.authClient.disable({ methods }, metadata));
  }

  verify({ codes }: TwoFactorVerifyRequestDto, sessionId: string) {
    const metadata = new Metadata();
    metadata.set('sessionId', sessionId);

    return firstValueFrom(this.authClient.verify({ codes }, metadata));
  }

  async validateAuthResponse({ access_token, verify }: AuthData) {
    if (verify) {
      throw new HttpException(
        {
          message: `${verify.type} verification required`,
          access_token: access_token,
          methods: verify.methods,
        },
        428,
      );
    }

    return { access_token };
  }
}
