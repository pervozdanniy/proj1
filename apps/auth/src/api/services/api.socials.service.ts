import { Status } from '@grpc/grpc-js/build/src/constants';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { UserStatusEnum } from '~common/constants/user';
import { InjectGrpc } from '~common/grpc/helpers';
import { SocialsAuthRequest } from '~common/grpc/interfaces/auth';
import { UserServiceClient } from '~common/grpc/interfaces/core';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { AuthApiService } from '~svc/auth/src/api/services/api.service';

@Injectable()
export class ApiSocialsService implements OnModuleInit {
  constructor(@InjectGrpc('core') private readonly client: ClientGrpc, private readonly authService: AuthApiService) {}
  private userService: UserServiceClient;

  onModuleInit() {
    this.userService = this.client.getService('UserService');
  }

  async loginSocials(request: SocialsAuthRequest) {
    const { email, username, source } = request;
    const payload = {
      email,
      username,
      source,
      status: UserStatusEnum.Active,
      contacts: [],
    };

    let { user } = await firstValueFrom(this.userService.findByLogin({ login: email }));
    if (!user) {
      user = await firstValueFrom(this.userService.create(payload));
    } else {
      if (user.source !== source) {
        throw new GrpcException(Status.ALREADY_EXISTS, 'User already exist!', 409);
      }
    }

    return this.authService.login(user);
  }
}
