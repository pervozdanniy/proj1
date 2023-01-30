import { Metadata } from '@grpc/grpc-js';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { TwoFactorMethod } from '~common/constants/auth';
import { InjectGrpc } from '~common/grpc/helpers';
import { TwoFactorServiceClient } from '~common/grpc/interfaces/auth';
import { SessionService } from '~common/session';
import { TwoFactorEnableRequestDto, TwoFactorVerifyRequestDto } from '../dto/2fa.request.dto';

@Injectable()
export class TwoFactorService implements OnModuleInit {
  private authClient: TwoFactorServiceClient;

  constructor(@InjectGrpc('auth') private readonly auth: ClientGrpc, private readonly session: SessionService) {}

  onModuleInit() {
    this.authClient = this.auth.getService('TwoFactorService');
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
}
