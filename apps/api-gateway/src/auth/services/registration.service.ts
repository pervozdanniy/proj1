import { Metadata } from '@grpc/grpc-js';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { RegisterServiceClient } from '~common/grpc/interfaces/auth';
import { TwoFactorVerifyResponseDto } from '../dto/2fa.reponse.dto';
import { AuthResponseDto } from '../dto/auth.response.dto';
import {
  ChangeAgreementStatusDto,
  CreateAgreementRequestDto,
  RegistrationFinishRequestDto,
  RegistrationStartRequestDto,
  RegistrationVerifyRequestDto,
} from '../dto/registration.dto';
import { parseAuthResponse, parseVerificationResponse } from '../helpers/2fa';

@Injectable()
export class RegistrationService implements OnModuleInit {
  private authClient: RegisterServiceClient;

  constructor(@InjectGrpc('auth') private readonly auth: ClientGrpc) {}

  onModuleInit() {
    this.authClient = this.auth.getService('RegisterService');
  }

  async start(payload: RegistrationStartRequestDto): Promise<AuthResponseDto> {
    const resp = await firstValueFrom(this.authClient.registerStart(payload));

    return parseAuthResponse(resp);
  }

  async verify(payload: RegistrationVerifyRequestDto, sessionId: string): Promise<TwoFactorVerifyResponseDto> {
    const metadata = new Metadata();
    metadata.set('sessionId', sessionId);

    const resp = await firstValueFrom(this.authClient.registerVerify(payload, metadata));

    return parseVerificationResponse(resp);
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
