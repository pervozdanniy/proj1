import { Metadata } from '@grpc/grpc-js';
import { ConflictException, HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { ResetPasswordServiceClient } from '~common/grpc/interfaces/auth';
import { ChangePasswordTypeDto } from '../dto/change-password-type.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { ResetPasswordFinishDto, ResetPasswordStartDto, ResetPasswordVerifyDto } from '../dto/reset-password.dto';

@Injectable()
export class ResetPasswordService implements OnModuleInit {
  private authClient: ResetPasswordServiceClient;

  constructor(@InjectGrpc('auth') private readonly auth: ClientGrpc) {}

  onModuleInit() {
    this.authClient = this.auth.getService('ResetPasswordService');
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

  changePasswordStart(payload: ChangePasswordTypeDto, sessionId: string) {
    const metadata = new Metadata();
    metadata.set('sessionId', sessionId);

    return firstValueFrom(this.authClient.changePasswordStart(payload, metadata));
  }

  changeOldPassword(payload: ChangePasswordDto, sessionId: string) {
    const metadata = new Metadata();
    metadata.set('sessionId', sessionId);

    return firstValueFrom(this.authClient.changeOldPassword(payload, metadata));
  }
}
