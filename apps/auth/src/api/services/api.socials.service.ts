import { Status } from '@grpc/grpc-js/build/src/constants';
import { Injectable } from '@nestjs/common';
import { UserSourceEnum } from '~common/constants/user';
import { AuthData, RegisterSocialRequest, SocialsAuthRequest } from '~common/grpc/interfaces/auth';
import { SessionProxy } from '~common/session';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { AuthService } from '../../auth/auth.service';
import { AuthApiService } from './api.service';
import { ApiRegisterService } from './register.service';

@Injectable()
export class ApiSocialsService {
  constructor(
    private readonly apiAuthService: AuthApiService,
    private readonly registerService: ApiRegisterService,
    private readonly authService: AuthService,
  ) {}

  async loginSocials({ social_id, source, email }: SocialsAuthRequest, session: SessionProxy) {
    const user =
      source !== UserSourceEnum.Api && social_id
        ? await this.authService.findBySocialId(social_id)
        : await this.authService.findByLogin({ email });

    if (user) {
      if (user.source === source) {
        return this.apiAuthService.login(user, session);
      }

      throw new GrpcException(Status.ALREADY_EXISTS, `User already exist for ${user.source} provider!`);
    } else {
      throw new GrpcException(Status.NOT_FOUND, 'User not found!');
    }
  }

  async registerSocials(request: RegisterSocialRequest, session: SessionProxy): Promise<AuthData> {
    const user = await this.authService.findByLogin({ email: request.email, phone: request.phone });
    if (user) {
      throw new GrpcException(Status.ALREADY_EXISTS, 'User already exist!');
    }

    return this.registerService.registerStart(request, session);
  }
}
