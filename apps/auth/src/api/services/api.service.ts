import { Auth2FAService } from '@/auth-2fa/2fa.service';
import { AuthService } from '@/auth/auth.service';
import { ConflictException, Injectable } from '@nestjs/common';
import { PreRegisteredSessionInterface } from '~common/constants/auth';
import { UserSourceEnum } from '~common/constants/user';
import { SessionInterface, SessionProxy, SessionService } from '~common/grpc-session';
import { AuthData, RegisterFinishRequest, RegisterStartRequest, TwoFactorCode } from '~common/grpc/interfaces/auth';
import { User } from '~common/grpc/interfaces/common';

@Injectable()
export class AuthApiService {
  constructor(
    private readonly auth: AuthService,
    private readonly auth2FA: Auth2FAService,
    private readonly session: SessionService<PreRegisteredSessionInterface>,
  ) {}

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

  async logout(session: SessionProxy<SessionInterface>) {
    try {
      await session.destroy();

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async registerStart(payload: RegisterStartRequest) {
    const isUnique = await this.auth.checkIfUnique(payload);
    if (!isUnique) {
      throw new ConflictException('User with same phone or email already exists');
    }

    const session: PreRegisteredSessionInterface = { register: payload };
    const sessionId = await this.auth.generateSession(session);

    const token = await this.auth.generateToken(sessionId);
    const resp: AuthData = { access_token: token };
    const methods = await this.auth2FA.requireConfirmation(sessionId, session);
    if (methods.length) {
      resp.verify = { type: 'Registration confirmation', methods };
    }

    return resp;
  }

  async registerVerify(payload: TwoFactorCode, sessionId: string) {
    return this.auth2FA.verifyOne(payload, sessionId);
  }

  async registerFinish(payload: RegisterFinishRequest, session: SessionProxy<PreRegisteredSessionInterface>) {
    await session.destroy();

    const user = await this.auth.createUser({ ...payload, ...session.register, source: UserSourceEnum.Api });

    return user;
  }
}
