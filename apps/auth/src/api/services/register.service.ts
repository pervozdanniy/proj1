import { ConflictException, Injectable } from '@nestjs/common';
import { UserSourceEnum } from '~common/constants/user';
import {
  AuthData,
  CreateAgreementRequest,
  RegisterFinishRequest,
  RegisterStartRequest,
  TwoFactorCode,
} from '~common/grpc/interfaces/auth';
import { UserAgreement } from '~common/grpc/interfaces/common';
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

@Injectable()
export class ApiRegisterService {
  constructor(private readonly auth: AuthService, private readonly auth2FA: Auth2FAService) {}

  async registerStart(payload: RegisterStartRequest, session: SessionProxy) {
    const isUnique = await this.auth.checkIfUnique(payload);
    if (!isUnique) {
      throw new ConflictException('User with same phone or email already exists');
    }

    const resp: AuthData = await this.auth.generateToken(session.id);

    const methods = await this.auth2FA.registrationConfirmation(startRegistration(session, payload));
    if (methods.length) {
      resp.verify = { methods };
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
    registerRequestAgreement(session, { user_details: payload });

    const contentResponse = agreement.content.replace(/\n|\t/g, '').replace(/\\"/g, '"');
    const closingTag = 'of this Agreement.</span></span>';
    const position = contentResponse.indexOf(closingTag);
    const content = contentResponse.substring(0, position + closingTag.length);

    return { ...agreement, content };
  }

  async registerFinish(payload: RegisterFinishRequest, session: SessionProxy) {
    if (!isRegistrationAgreement(session)) {
      throw new ConflictException('Registration agreement process was not started');
    }

    const user = await this.auth.createUser({
      ...payload,
      ...session.register,
      ...session.user_data.user_details,
      source: session.register.source ?? UserSourceEnum.Api,
    });
    finishRegistration(session, user);
    // if (user.source === UserSourceEnum.Api) {
    //   await this.auth2FA.setEnabled([TwoFactorMethod.Email, TwoFactorMethod.Sms], finishRegistration(session, user));
    // }

    return user;
  }
}
