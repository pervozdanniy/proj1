import { Metadata } from '@grpc/grpc-js';
import { ConflictException, HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { TwoFactorMethod } from '~common/constants/auth';
import { InjectGrpc } from '~common/grpc/helpers';
import { TwoFactorServiceClient } from '~common/grpc/interfaces/auth';
import { TwoFactorVerifyResponseDto } from '../dto/2fa.reponse.dto';
import { TwoFactorEnableRequestDto, TwoFactorVerificationDto, TwoFactorVerifyRequestDto } from '../dto/2fa.request.dto';
import { parseVerificationResponse } from '../helpers/2fa';

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

  async enable(settings: TwoFactorEnableRequestDto, sessionId: string) {
    const metadata = new Metadata();
    metadata.set('sessionId', sessionId);

    const { required, error } = await firstValueFrom(this.authClient.enable({ settings }, metadata));
    if (error) {
      throw new ConflictException(error);
    }

    throw new HttpException(
      { message: 'Verification required', methods: required.methods },
      HttpStatus.PRECONDITION_REQUIRED,
    );
  }

  async disable(methods: TwoFactorMethod[] | undefined, sessionId: string) {
    const metadata = new Metadata();
    metadata.set('sessionId', sessionId);

    const { required, error } = await firstValueFrom(this.authClient.disable({ methods }, metadata));
    if (error) {
      throw new ConflictException(error);
    }

    throw new HttpException(
      { message: 'Verification required', methods: required.methods },
      HttpStatus.PRECONDITION_REQUIRED,
    );
  }

  verify(payload: TwoFactorVerifyRequestDto, sessionId: string) {
    const metadata = new Metadata();
    metadata.set('sessionId', sessionId);

    return firstValueFrom(this.authClient.verify(payload, metadata));
  }

  async verifyOne(payload: TwoFactorVerificationDto, sessionId: string): Promise<TwoFactorVerifyResponseDto> {
    const metadata = new Metadata();
    metadata.set('sessionId', sessionId);

    const resp = await firstValueFrom(this.authClient.verifyOne(payload, metadata));

    return parseVerificationResponse(resp);
  }

  resend(method: TwoFactorMethod, sessionId: string) {
    const metadata = new Metadata();
    metadata.set('sessionId', sessionId);

    return firstValueFrom(this.authClient.resend({ method }, metadata));
  }
}
