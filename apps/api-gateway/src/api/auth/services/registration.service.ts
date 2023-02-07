import { Metadata } from '@grpc/grpc-js';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PreRegisteredSessionInterface } from '~common/constants/auth/registration/interfaces';
import { InjectGrpc } from '~common/grpc/helpers';
import { AuthServiceClient } from '~common/grpc/interfaces/auth';
import { UserServiceClient } from '~common/grpc/interfaces/core';
import { SessionProxy } from '~common/session';
import { RegistrationFinishRequestDto, RegistrationStartRequestDto } from '../dto/registration.dto';

@Injectable()
export class RegistrationService implements OnModuleInit {
  private authClient: AuthServiceClient;
  private userService: UserServiceClient;

  constructor(
    @InjectGrpc('auth') private readonly auth: ClientGrpc,
    @InjectGrpc('core') private readonly core: ClientGrpc,
  ) {}

  onModuleInit() {
    this.userService = this.core.getService('UserService');
    this.authClient = this.auth.getService('AuthService');
  }

  start(payload: RegistrationStartRequestDto) {
    return firstValueFrom(this.authClient.preRegister(payload));
  }

  async finish(payload: RegistrationFinishRequestDto, session: SessionProxy<PreRegisteredSessionInterface>) {
    const user = firstValueFrom(this.userService.create({ ...payload, ...session.register }));

    const metadata = new Metadata();
    metadata.set('sessionId', session.sessionId);
    await firstValueFrom(this.authClient.logout({}, metadata));

    return user;
  }
}
