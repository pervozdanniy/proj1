import { Injectable } from '@nestjs/common';
import { AuthData } from '~common/grpc/interfaces/auth';
import { User } from '~common/grpc/interfaces/common';
import { Auth2FAService } from '../../auth-2fa/2fa.service';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class AuthApiService {
  constructor(private readonly auth: AuthService, private readonly auth2FA: Auth2FAService) {}

  async validateUser(login: string, pass: string): Promise<User | null> {
    return this.auth.validateUser(login, pass);
  }

  async findByLogin(login: string) {
    return this.auth.findByLogin(login);
  }

  async findUser(id: number) {
    return this.auth.findUser(id);
  }

  async login(user: User) {
    const { sessionId, session } = await this.auth.login(user);

    const token = await this.auth.generateToken(sessionId);
    const resp: AuthData = { access_token: token };
    const methods = await this.auth2FA.requireIfEnabled(sessionId, session);
    if (methods.length) {
      resp.verify = { type: '2FA', methods };
    }

    return resp;
  }
}
