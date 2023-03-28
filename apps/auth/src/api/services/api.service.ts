import { Auth2FAService } from '@/auth-2fa/2fa.service';
import { AuthService } from '@/auth/auth.service';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { TwoFactorMethod } from '~common/constants/auth';
import { UserSourceEnum, UserStatusEnum } from '~common/constants/user';
import { ChangePasswordTypes } from '~common/enum/change-password-types';
import {
  changeEmail,
  changePhone,
  finishRegistration,
  isChangeContactInfo,
  isPasswordReset,
  isRegistration,
  isRegistrationAgreement,
  registerRequestAgreement,
  resetPassword,
  SessionProxy,
  startRegistration,
} from '~common/grpc-session';
import {
  ApproveAgreementRequest,
  AuthData,
  ChangeOldPasswordRequest,
  ChangePasswordStartRequest,
  CreateAgreementRequest,
  RegisterFinishRequest,
  RegisterStartRequest,
  TwoFactorCode,
  Verification,
} from '~common/grpc/interfaces/auth';
import { IdRequest, SuccessResponse, User, UserAgreement } from '~common/grpc/interfaces/common';
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

  async resetLogin(user: User, session: SessionProxy) {
    const token = await this.auth.login(user, session);

    const resp: AuthData = { access_token: token };

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
    if (!isRegistration(session)) {
      throw new ConflictException('Registration process was not started');
    }

    return this.auth2FA.verifyOne(payload, session);
  }

  async createAgreement(payload: CreateAgreementRequest, session: SessionProxy): Promise<UserAgreement> {
    if (!isRegistration(session)) {
      throw new ConflictException('Registration process was not started');
    }

    try {
      const agreement = await this.auth.createAgreement({ ...payload, ...session.register });

      registerRequestAgreement(session, { user_details: payload, agreement: { id: agreement.id, status: false } });

      const contentResponse = agreement.content.replace(/\n|\t/g, '').replace(/\\"/g, '"');
      const closingTag = 'of this Agreement.</span></span>';
      const position = contentResponse.indexOf(closingTag);
      const content = contentResponse.substring(0, position + closingTag.length);

      return { ...agreement, content };
    } catch (e) {
      throw new ConflictException(e.details);
    }
  }

  async approveAgreement({ id }: ApproveAgreementRequest, session: SessionProxy): Promise<SuccessResponse> {
    if (!isRegistrationAgreement(session)) {
      throw new ConflictException('Registration agreement process was not started');
    }
    if (id === session.user_data.agreement.id) {
      session.user_data.agreement.status = true;
    } else {
      throw new ConflictException('Unknown agreement id!');
    }

    return { success: true };
  }

  async registerFinish(payload: RegisterFinishRequest, session: SessionProxy) {
    if (!isRegistrationAgreement(session)) {
      throw new ConflictException('Registration agreement process was not started');
    }

    if (session.user_data.agreement.status !== true) {
      throw new ConflictException('Please approve agreement!');
    }
    const user = await this.auth.createUser({
      ...payload,
      ...session.register,
      ...session.user_data.user_details,
      source: session.register.source ?? UserSourceEnum.Api,
    });
    finishRegistration(session, user);
    const currentUser = await this.auth.getUserById(user.id);

    await this.auth2FA.setEnabled([TwoFactorMethod.Email, TwoFactorMethod.Sms], finishRegistration(session, user));

    return currentUser;
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
    resp.verify = { type: 'Reset password confirmation', methods: [method] };

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
      throw new BadRequestException('Phone or email should be specified');
    }

    this.auth2FA.requireOne(method, resetPassword(session));

    return { type: 'Reset password confirmation', methods: [method] };
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

  async closeAccount({ id }: IdRequest, session: SessionProxy): Promise<User> {
    let user = await this.auth.getUserById(id);
    if (user.status === UserStatusEnum.Closed) {
      throw new BadRequestException('User account has already closed!');
    }
    user = await this.auth.updateUser({ id, status: UserStatusEnum.Closed });
    const notificationPayload = {
      user_id: user.id,
      title: 'User account',
      type: 'accounts',
      description: `Your account closed!`,
    };
    await this.auth.sendNotification(notificationPayload);
    session.user = user;

    return user;
  }

  async openAccount({ id }: IdRequest): Promise<User> {
    let user: User | undefined;

    try {
      user = await this.auth.getUserById(id);
    } catch (e) {
      throw new BadRequestException('No such user exists!');
    }
    if (user.status === UserStatusEnum.Active) {
      throw new BadRequestException('User account has already opened!');
    }

    return await this.auth.updateUser({ id, status: UserStatusEnum.Active });
  }
  changeContactStart(payload: { email?: string; phone?: string }, session: SessionProxy) {
    if (payload.email) {
      this.auth2FA.requireOne(TwoFactorMethod.Email, changeEmail(session, payload.email));

      return { type: 'Change email confirmation', methods: [TwoFactorMethod.Email] };
    }
    if (payload.phone) {
      this.auth2FA.requireOne(TwoFactorMethod.Sms, changePhone(session, payload.phone));

      return { type: 'Change phone confirmation', methods: [TwoFactorMethod.Sms] };
    }

    throw new BadRequestException('Invalid payload');
  }

  async changeContactVerify(code: TwoFactorCode, session: SessionProxy) {
    if (!isChangeContactInfo(session)) {
      throw new ConflictException('Change phone process was not started');
    }
    const res = await this.auth2FA.verifyOne(code, session);
    if (res.valid) {
      await this.auth.updateUser({ id: session.user.id, ...session.change });
    }

    return res;
  }
}
