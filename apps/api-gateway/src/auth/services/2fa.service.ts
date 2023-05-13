import { Metadata } from '@grpc/grpc-js';
import { ConflictException, HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { TwoFactorMethod } from '~common/constants/auth';
import { InjectGrpc } from '~common/grpc/helpers';
import { AuthData, TwoFactorServiceClient } from '~common/grpc/interfaces/auth';
import { TwoFactorEnableRequestDto, TwoFactorVerificationDto, TwoFactorVerifyRequestDto } from '../dto/2fa.request.dto';

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

  async verifyOne(payload: TwoFactorVerificationDto, sessionId: string) {
    const metadata = new Metadata();
    metadata.set('sessionId', sessionId);

    const resp = await firstValueFrom(this.authClient.verifyOne(payload, metadata));
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

  resend(method: TwoFactorMethod, sessionId: string) {
    const metadata = new Metadata();
    metadata.set('sessionId', sessionId);

    return firstValueFrom(this.authClient.resend({ method }, metadata));
  }

  async validateAuthResponse({ verify, ...tokens }: AuthData) {
    if (verify) {
      throw new HttpException(
        {
          message: `${verify.type} verification required`,
          methods: verify.methods,
          ...tokens,
        },
        HttpStatus.PRECONDITION_REQUIRED,
      );
    }

    return tokens;
  }
}
