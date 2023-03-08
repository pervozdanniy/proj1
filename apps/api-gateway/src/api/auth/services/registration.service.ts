import { Metadata } from '@grpc/grpc-js';
import { ConflictException, HttpException, Injectable, OnModuleInit } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { AuthServiceClient } from '~common/grpc/interfaces/auth';
import {
  ChangeAgreementStatusDto,
  CreateAgreementRequestDto,
  RegistrationFinishRequestDto,
  RegistrationStartRequestDto,
  RegistrationVerifyRequestDto,
} from '../dto/registration.dto';

@Injectable()
export class RegistrationService implements OnModuleInit {
  private authClient: AuthServiceClient;

  constructor(@InjectGrpc('auth') private readonly auth: ClientGrpc) {}

  onModuleInit() {
    this.authClient = this.auth.getService('AuthService');
  }

  start(payload: RegistrationStartRequestDto) {
    return firstValueFrom(this.authClient.registerStart(payload));
  }

  async verify(payload: RegistrationVerifyRequestDto, sessionId: string) {
    const metadata = new Metadata();
    metadata.set('sessionId', sessionId);

    const resp = await firstValueFrom(this.authClient.registerVerify(payload, metadata));
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

  async finish(payload: RegistrationFinishRequestDto, sessionId: string) {
    const metadata = new Metadata();
    metadata.set('sessionId', sessionId);

    return firstValueFrom(this.authClient.registerFinish(payload, metadata));
  }

  async createAgreement(payload: CreateAgreementRequestDto, sessionId: string) {
    const metadata = new Metadata();
    metadata.set('sessionId', sessionId);

    return firstValueFrom(this.authClient.createAgreement(payload, metadata));
  }

  async approveAgreement(payload: ChangeAgreementStatusDto, sessionId: string) {
    const metadata = new Metadata();
    metadata.set('sessionId', sessionId);

    return firstValueFrom(this.authClient.approveAgreement(payload, metadata));
  }
}
