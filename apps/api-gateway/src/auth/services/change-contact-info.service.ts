import { Metadata } from '@grpc/grpc-js';
import { ConflictException, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { AuthServiceClient } from '~common/grpc/interfaces/auth';
import { ChangeContactVerifyDto } from '../dto/change-contact-info.dto';

export class ChangeContactInfoService implements OnModuleInit {
  private authClient: AuthServiceClient;

  constructor(@InjectGrpc('auth') private readonly auth: ClientGrpc) {}

  onModuleInit() {
    this.authClient = this.auth.getService('AuthService');
  }

  start(payload: { email?: string; phone?: string }, sessionId: string) {
    const metadata = new Metadata();
    metadata.set('sessionId', sessionId);

    return firstValueFrom(this.authClient.changeContactInfoStart(payload, metadata));
  }

  async verify(payload: ChangeContactVerifyDto, sessionId: string) {
    const metadata = new Metadata();
    metadata.set('sessionId', sessionId);

    const resp = await firstValueFrom(this.authClient.changeContactInfoVerify(payload, metadata));
    if (!resp.valid) {
      throw new ConflictException(resp.reason);
    }

    return { valid: resp.valid };
  }
}
