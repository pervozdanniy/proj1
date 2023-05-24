import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ChangePasswordTypes } from '~common/enum/change-password-types';
import {
  AuthData,
  ChangeOldPasswordRequest,
  ChangePasswordStartRequest,
  TwoFactorCode,
  Verification,
} from '~common/grpc/interfaces/auth';
import { SuccessResponse, User } from '~common/grpc/interfaces/common';
import { isPasswordReset, resetPassword, SessionProxy } from '~common/session';
import { Auth2FAService } from '../../auth-2fa/2fa.service';
import { AuthService } from '../../auth/auth.service';
import { TwoFactorMethod } from '../../entities/2fa_settings.entity';
import { ResetPasswordDto } from '../dto/reset-password.dto';

@Injectable()
export class ApiResetPasswordService {
  constructor(private readonly auth: AuthService, private readonly auth2FA: Auth2FAService) {}

  resetLogin(user: User, session: SessionProxy) {
    return this.auth.login(user, session);
  }

  async resetPasswordStart(payload: ResetPasswordDto, session: SessionProxy) {
    let user: User | undefined;
    let method: TwoFactorMethod;
    if (payload.email) {
      user = await this.auth.findByEmail(payload.email);
      method = TwoFactorMethod.Email;
    } else if (payload.phone) {
      user = await this.auth.findByPhone(payload.phone);
      method = TwoFactorMethod.Sms;
    } else {
      throw new BadRequestException('Phone or email should be specified');
    }
    if (!user) {
      throw new NotFoundException('No such user exists');
    }
    session.user = user;
    this.auth2FA.requireOne(method, resetPassword(session));

    const resp: AuthData = await this.resetLogin(user, session);
    resp.verify = { methods: [method] };

    return resp;
  }

  async resetPasswordVerify(payload: TwoFactorCode, session: SessionProxy) {
    if (!isPasswordReset(session)) {
      throw new ConflictException('Password reset process was not started');
    }

    return this.auth2FA.verifyOne(payload, session);
  }

  async resetPasswordFinish(password: string, session: SessionProxy): Promise<SuccessResponse> {
    if (!isPasswordReset(session)) {
      throw new ConflictException('Password reset process was not started');
    }
    try {
      await this.auth.updateUser({ id: session.user.id, password });
    } catch (error) {
      return { success: false, error: 'Failed to update user password' };
    }
    await session.destroy().catch(() => {});

    return { success: true };
  }

  async changePasswordStart({ type }: ChangePasswordStartRequest, session: SessionProxy): Promise<Verification> {
    let method: TwoFactorMethod;
    if (type === ChangePasswordTypes.EMAIL) {
      method = TwoFactorMethod.Email;
    } else if (type === ChangePasswordTypes.PHONE) {
      method = TwoFactorMethod.Sms;
    } else {
      throw new BadRequestException('Email should be specified');
    }

    this.auth2FA.requireOne(method, resetPassword(session));

    return { methods: [method] };
  }

  async changeOldPassword(
    { old_password, new_password }: ChangeOldPasswordRequest,
    session: SessionProxy,
  ): Promise<SuccessResponse> {
    const user = session.user;
    const validate = await this.auth.validateUser(user.email, old_password);
    if (!validate) {
      throw new BadRequestException('Wrong password!');
    } else {
      await this.auth.updateUser({ id: user.id, password: new_password });

      return { success: true };
    }
  }
}
