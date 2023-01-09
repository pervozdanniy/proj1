import { Status } from '@grpc/grpc-js/build/src/constants';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientGrpc } from '@nestjs/microservices';
import { Auth, google } from 'googleapis';
import { firstValueFrom } from 'rxjs';
import { UserSourceEnum, UserStatusEnum } from '~common/constants/user';
import { InjectGrpc } from '~common/grpc/helpers';
import { GoogleAuthRequest } from '~common/grpc/interfaces/auth';
import { UserServiceClient } from '~common/grpc/interfaces/core';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { AuthApiService } from '~svc/auth/src/api/api.service';

@Injectable()
export class ApiGoogleService implements OnModuleInit {
  oauthClient: Auth.OAuth2Client;
  constructor(
    private readonly configService: ConfigService,
    @InjectGrpc('core') private readonly client: ClientGrpc,

    private readonly authService: AuthApiService,
  ) {
    const clientID = this.configService.get('google')['client'];
    const clientSecret = this.configService.get('google')['secret'];

    this.oauthClient = new google.auth.OAuth2(clientID, clientSecret);
  }
  private userService: UserServiceClient;

  onModuleInit() {
    this.userService = this.client.getService('UserService');
  }

  async loginGoogle(request: GoogleAuthRequest) {
    const { token } = request;
    const userData = await this.getUserData(token);
    const payload = {
      email: userData.email,
      username: userData.name,
      source: UserSourceEnum.Google,
      status: UserStatusEnum.Active,
    };
    let { user } = await firstValueFrom(this.userService.findByLogin({ login: userData.email }));
    if (user.source !== UserSourceEnum.Google) {
      throw new GrpcException(Status.ALREADY_EXISTS, 'User already exist!', 409);
    }
    if (!user) {
      user = await firstValueFrom(this.userService.create(payload));
    }

    return this.authService.login(user);
  }

  async getUserData(token: string) {
    const userInfoClient = google.oauth2('v2').userinfo;
    this.oauthClient.setCredentials({
      access_token: token,
    });

    const userInfoResponse = await userInfoClient.get({
      auth: this.oauthClient,
    });

    return userInfoResponse.data;
  }
}
