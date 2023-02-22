import { Metadata } from '@grpc/grpc-js';
import { ConflictException, HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { AuthServiceClient } from '~common/grpc/interfaces/auth';
import { ResetPasswordFinishDto, ResetPasswordStartDto, ResetPasswordVerifyDto } from '../dto/reset-password.dto';

@Injectable()
export class ResetPasswordService implements OnModuleInit {
  private authClient: AuthServiceClient;

  constructor(@InjectGrpc('auth') private readonly auth: ClientGrpc) {}

  onModuleInit() {
    this.authClient = this.auth.getService('AuthService');
  }

  start(payload: ResetPasswordStartDto) {
    return firstValueFrom(this.authClient.resetPasswordStart(payload));
  }

  async verify(payload: ResetPasswordVerifyDto, sessionId: string) {
    const metadata = new Metadata();
    metadata.set('sessionId', sessionId);

    const resp = await firstValueFrom(this.authClient.resetPasswordVerify(payload, metadata));
    if (!resp.valid) {
      throw new ConflictException(resp.reason);
    }
    if (resp.unverified?.methods.length) {
      throw new HttpException(
        { message: '2FA is not finished', methods: resp.unverified.methods },
        HttpStatus.PRECONDITION_REQUIRED,
      );
    }

    return { valid: resp.valid };
  }

  async finish(payload: ResetPasswordFinishDto, sessionId: string) {
    const metadata = new Metadata();
    metadata.set('sessionId', sessionId);

    return firstValueFrom(this.authClient.resetPasswordFinish(payload, metadata));
  }
}
