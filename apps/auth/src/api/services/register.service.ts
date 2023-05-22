import { ConflictException, Injectable } from '@nestjs/common';
import { UserSourceEnum } from '~common/constants/user';
import {
  ApproveAgreementRequest,
  AuthData,
  CreateAgreementRequest,
  RegisterFinishRequest,
  RegisterStartRequest,
  TwoFactorCode,
} from '~common/grpc/interfaces/auth';
import { SuccessResponse, UserAgreement } from '~common/grpc/interfaces/common';
import {
  finishRegistration,
  isRegistration,
  isRegistrationAgreement,
  registerRequestAgreement,
  SessionProxy,
  startRegistration,
} from '~common/session';
import { Auth2FAService } from '../../auth-2fa/2fa.service';
import { AuthService } from '../../auth/auth.service';
import { TwoFactorMethod } from '../../entities/2fa_settings.entity';

@Injectable()
export class ApiRegisterService {
  constructor(private readonly auth: AuthService, private readonly auth2FA: Auth2FAService) {}

  async registerStart(payload: RegisterStartRequest, session: SessionProxy) {
    const isUnique = await this.auth.checkIfUnique(payload);
    if (!isUnique) {
      throw new ConflictException('User with same phone or email already exists');
    }

    const resp: AuthData = await this.auth.generateToken(session.id);

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

    const agreement = await this.auth.createAgreement({ ...payload, ...session.register });

    registerRequestAgreement(session, { user_details: payload, agreement: { id: agreement.id, status: false } });

    const contentResponse = agreement.content.replace(/\n|\t/g, '').replace(/\\"/g, '"');
    const closingTag = 'of this Agreement.</span></span>';
    const position = contentResponse.indexOf(closingTag);
    const content = contentResponse.substring(0, position + closingTag.length);

    return { ...agreement, content };
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

    if (currentUser.source === UserSourceEnum.Api) {
      await this.auth2FA.setEnabled([TwoFactorMethod.Email, TwoFactorMethod.Sms], finishRegistration(session, user));
    } else {
      await this.auth2FA.setEnabled([], finishRegistration(session, user));
    }

    return currentUser;
  }
}
