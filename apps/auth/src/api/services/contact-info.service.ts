import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { TwoFactorCode } from '~common/grpc/interfaces/auth';
import { changeEmail, changePhone, isChangeContactInfo, SessionProxy } from '~common/session';
import { Auth2FAService } from '../../auth-2fa/2fa.service';
import { AuthService } from '../../auth/auth.service';
import { TwoFactorMethod } from '../../entities/2fa_settings.entity';

@Injectable()
export class ApiContactInfoService {
  constructor(private readonly auth: AuthService, private readonly auth2FA: Auth2FAService) {}

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
