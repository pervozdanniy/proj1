import { Status } from '@grpc/grpc-js/build/src/constants';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { SocialsAuthRequest } from '~common/grpc/interfaces/auth';
import { UserServiceClient } from '~common/grpc/interfaces/core';
import { SessionProxy } from '~common/session';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { AuthApiService } from './api.service';

@Injectable()
export class ApiSocialsService implements OnModuleInit {
  constructor(@InjectGrpc('core') private readonly client: ClientGrpc, private readonly authService: AuthApiService) {}
  private userService: UserServiceClient;

  onModuleInit() {
    this.userService = this.client.getService('UserService');
  }

  async loginSocials(request: SocialsAuthRequest, session: SessionProxy) {
    const { user } = await firstValueFrom(this.userService.findByLogin({ email: request.email, phone: request.phone }));
    if (user) {
      if (user.source === request.source) {
        return this.authService.login(user, session);
      }

      throw new GrpcException(Status.ALREADY_EXISTS, 'User already exist!');
    }

    return this.authService.registerStart(request, session);
  }
}
