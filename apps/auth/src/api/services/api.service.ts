import { Auth2FAService } from '@/auth-2fa/2fa.service';
import { AuthService } from '@/auth/auth.service';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import {
  finishRegistration,
  isPasswordReset,
  isPreRegistered,
  resetPassword,
  startRegistration,
  TwoFactorMethod,
} from '~common/constants/auth';
import { UserSourceEnum } from '~common/constants/user';
import { SessionProxy } from '~common/grpc-session';
import { AuthData, RegisterFinishRequest, RegisterStartRequest, TwoFactorCode } from '~common/grpc/interfaces/auth';
import { SuccessResponse, User } from '~common/grpc/interfaces/common';
import { BaseSettingsDto } from '../dto/2fa.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';

@Injectable()
export class AuthApiService {
  constructor(private readonly auth: AuthService, private readonly auth2FA: Auth2FAService) {}

  async validateUser(login: string, pass: string): Promise<User | null> {
    return this.auth.validateUser(login, pass);
  }

  async login(user: User, session: SessionProxy) {
    const token = await this.auth.login(user, session);

    const resp: AuthData = { access_token: token };

    const methods = await this.auth2FA.requireIfEnabled(session);
    if (methods.length) {
      resp.verify = { type: '2FA Verification', methods };
    }

    return resp;
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
    finishRegistration(session, user);

    return user;
  }

  async resetPasswordStart(payload: ResetPasswordDto, session: SessionProxy) {
    let user: User | undefined;
    let settings: BaseSettingsDto;
    if (payload.email) {
      user = await this.auth.findByEmail(payload.email);
      settings = { method: TwoFactorMethod.Email, destination: payload.email };
    } else if (payload.phone) {
      user = await this.auth.findByPhone(payload.phone);
      settings = { method: TwoFactorMethod.Sms, destination: payload.phone };
    } else {
      throw new BadRequestException('Phone or email should be specified');
    }
    if (!user) {
      throw new NotFoundException('No such user exists');
    }
    this.auth2FA.requireOne(settings, resetPassword(session));

    const resp: AuthData = await this.login(user, session);
    resp.verify = { type: 'Reset password confirmation', methods: [settings.method] };

    return resp;
  }

  async resetPasswordVerify(payload: TwoFactorCode, session: SessionProxy) {
    if (!isPasswordReset(session)) {
      throw new ConflictException('Password reset process was not stated');
    }

    return this.auth2FA.verifyOne(payload, session);
  }

  async resetPasswordFinish(password: string, session: SessionProxy): Promise<SuccessResponse> {
    if (!isPasswordReset(session)) {
      throw new ConflictException('Password reset process was not stated');
    }
    try {
      await this.auth.updateUser({ id: session.user.id, password });
    } catch (error) {
      return { success: false, error: 'Failed to update user password' };
    }
    await session.destroy().catch(() => {});

    return { success: true };
  }
}
