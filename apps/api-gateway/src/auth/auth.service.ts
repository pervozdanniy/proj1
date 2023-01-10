import { OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { AuthRequest, AuthServiceClient } from '~common/grpc/interfaces/auth';
import { SocialsUserDto } from '~svc/api-gateway/src/auth/dto/socials-user.dto';

export class AuthService implements OnModuleInit {
  private authClient: AuthServiceClient;

  constructor(@InjectGrpc('auth') private readonly auth: ClientGrpc) {}

  onModuleInit() {
    this.authClient = this.auth.getService('AuthService');
  }

  login(credentials: AuthRequest) {
    return firstValueFrom(this.authClient.login(credentials));
  }

  loginSocials(payload: SocialsUserDto) {
    return firstValueFrom(this.authClient.loginSocials(payload));
  }
}
