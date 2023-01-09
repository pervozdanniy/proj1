import { OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { AuthRequest, AuthServiceClient } from '~common/grpc/interfaces/auth';

export class AuthService implements OnModuleInit {
  private authClient: AuthServiceClient;

  constructor(@InjectGrpc('auth') private readonly auth: ClientGrpc) {}

  onModuleInit() {
    this.authClient = this.auth.getService('AuthService');
  }

  login(credentials: AuthRequest) {
    return firstValueFrom(this.authClient.login(credentials));
  }

  loginGoogle(tokenData) {
    return firstValueFrom(this.authClient.loginGoogle(tokenData));
  }
}
