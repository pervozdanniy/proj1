import { Metadata } from '@grpc/grpc-js';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { ResetPasswordServiceClient } from '~common/grpc/interfaces/auth';
import { TwoFactorVerificationDto, TwoFactorVerifyDto } from '../dto/2fa.reponse.dto';
import { AuthResponseDto } from '../dto/auth.response.dto';
import { ChangePasswordTypeDto } from '../dto/change-password-type.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { ResetPasswordFinishDto, ResetPasswordStartDto, ResetPasswordVerifyDto } from '../dto/reset-password.dto';
import { parseAuthResponse, parseVerificationResponse } from '../helpers/2fa';

@Injectable()
export class ResetPasswordService implements OnModuleInit {
  private authClient: ResetPasswordServiceClient;

  constructor(@InjectGrpc('auth') private readonly auth: ClientGrpc) {}

  onModuleInit() {
    this.authClient = this.auth.getService('ResetPasswordService');
  }

  async start(payload: ResetPasswordStartDto): Promise<AuthResponseDto> {
    const resp = await firstValueFrom(this.authClient.resetPasswordStart(payload));

    return parseAuthResponse(resp);
  }

  async verify(payload: ResetPasswordVerifyDto, sessionId: string): Promise<TwoFactorVerifyDto> {
    const metadata = new Metadata();
    metadata.set('sessionId', sessionId);

    const resp = await firstValueFrom(this.authClient.resetPasswordVerify(payload, metadata));

    return parseVerificationResponse(resp);
  }

  async finish(payload: ResetPasswordFinishDto, sessionId: string) {
    const metadata = new Metadata();
    metadata.set('sessionId', sessionId);

    return firstValueFrom(this.authClient.resetPasswordFinish(payload, metadata));
  }

  changePasswordStart(payload: ChangePasswordTypeDto, sessionId: string): Promise<TwoFactorVerificationDto> {
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
