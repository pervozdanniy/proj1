import { Auth2FAService } from '@/auth-2fa/2fa.service';
import { AuthService } from '@/auth/auth.service';
import { ConflictException, Injectable } from '@nestjs/common';
import { finishRegistration, isPreRegistered, startRegistration } from '~common/constants/auth';
import { UserSourceEnum } from '~common/constants/user';
import { SessionProxy } from '~common/grpc-session';
import { AuthData, RegisterFinishRequest, RegisterStartRequest, TwoFactorCode } from '~common/grpc/interfaces/auth';
import { User } from '~common/grpc/interfaces/common';

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

  async login(user: User, session: SessionProxy) {
    const token = await this.auth.login(user, session);

    return { access_token: token };
  }

  async logout(session: SessionProxy) {
    try {
      await session.destroy();

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async registerStart(payload: RegisterStartRequest, session: SessionProxy) {
    const isUnique = await this.auth.checkIfUnique(payload);
    if (!isUnique) {
      throw new ConflictException('User with same phone or email already exists');
    }

    const token = await this.auth.generateToken(session.id);
    const resp: AuthData = { access_token: token };

    const methods = await this.auth2FA.requireConfirmation(startRegistration(session, payload));
    if (methods.length) {
      resp.verify = { type: 'Registration confirmation', methods };
    }

    return resp;
  }

  async registerVerify(payload: TwoFactorCode, session: SessionProxy) {
    if (!isPreRegistered(session)) {
      throw new ConflictException('Registration process was not stated');
    }

    return this.auth2FA.verifyOne(payload, session);
  }

  async registerFinish(payload: RegisterFinishRequest, session: SessionProxy) {
    if (!isPreRegistered(session)) {
      throw new ConflictException('Registration process was not stated');
    }
    const user = await this.auth.createUser({ ...payload, ...session.register, source: UserSourceEnum.Api });
    const a = finishRegistration(session, user);

    return user;
  }
}
