import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TwoFactorConstraint, TwoFactorMethod } from '~common/constants/auth';
import {
  confirm2FA,
  confirm2FAMethod,
  is2FA,
  isRegistration,
  registerIsSocial,
  require2FA,
  SessionProxy,
} from '~common/grpc-session';
import { User } from '~common/grpc/interfaces/common';
import { TwoFactorSettingsEntity } from '../entities/2fa_settings.entity';
import { Notifier2FAService } from './notifier.service';

@Injectable()
export class Auth2FAService {
  constructor(
    @InjectRepository(TwoFactorSettingsEntity) private readonly settingsRepo: Repository<TwoFactorSettingsEntity>,
    private readonly notify: Notifier2FAService,
  ) {}

  private generate(settings: Array<{ method: TwoFactorMethod; destination: string }>): TwoFactorConstraint[] {
    return settings.map(({ method, destination }) => ({
      method,
      code: this.generateCode(),
      destination,
    }));
  }

  private generateCode() {
    return Math.floor(100000 + Math.random() * 899999);
  }

  private getDestination(method: TwoFactorMethod, user: User) {
    switch (method) {
      case TwoFactorMethod.Email:
        return user.email;
      case TwoFactorMethod.Sms:
        return user.phone;
    }
  }

  async requireConfirmation(session: SessionProxy) {
    if (!isRegistration(session)) {
      throw new ConflictException('Registration process was not started');
    }

    //  const settings = [{ method: TwoFactorMethod.Sms, destination: session.register.phone }];
    const settings = [];
    if (!registerIsSocial(session)) {
      settings.push({ method: TwoFactorMethod.Email, destination: session.register.email });
    }

    const constraints = this.generate(settings);
    require2FA(session, {
      verify: constraints,
      expiresAt: Date.now() + 15 * 60 * 60 * 1000,
    });
    this.notify.send(constraints, session.id);

    if (registerIsSocial(session)) {
      Object.assign(session, { twoFactor: { isVerified: true } });
      await session.save();
    }

    return settings.map((s) => s.method);
  }

  async requireIfEnabled(session: SessionProxy) {
    //temporary method: TwoFactorMethod.Email
    const enabled = await this.settingsRepo.findBy({ user_id: session.user.id, method: TwoFactorMethod.Email });
    if (enabled.length) {
      const contstraints = this.generate(enabled);
      require2FA(session, {
        verify: contstraints,
        expiresAt: Date.now() + 15 * 60 * 60 * 1000,
      });
      this.notify.send(contstraints, session.id);
    }

    return enabled.map((s) => s.method);
  }

  async requireOrFail(session: SessionProxy) {
    const enabled = await this.requireIfEnabled(session);
    if (enabled.length === 0) {
      throw new Error('No 2FA methods are enabled. Enable at least one to continue');
    }

    return enabled;
  }

  requireOne(method: TwoFactorMethod, session: SessionProxy) {
    const destination = this.getDestination(method, session.user);
    const verify = this.generate([{ method, destination }]);
    require2FA(session, { verify, expiresAt: Date.now() + 15 * 60 * 60 * 1000 });
    this.notify.send(verify, session.id);
  }

  async getEnabled(userId: number) {
    const entities = await this.settingsRepo.find({ select: ['method'], where: { user_id: userId } });

    return entities.map((e) => e.method);
  }

  async setEnabled(methods: TwoFactorMethod[], session: SessionProxy) {
    const entites = methods.map((method) => ({
      method,
      destination: this.getDestination(method, session.user),
      user_id: session.user.id,
    }));
    await this.settingsRepo.insert(entites);
  }

  async enable(method: TwoFactorMethod, session: SessionProxy) {
    const enabled = await this.settingsRepo.findBy({ user_id: session.user.id });

    const codes = this.generate(enabled);
    if (enabled.findIndex((s) => s.method === method) >= 0) {
      throw new ConflictException(`Method ${method} is already enabled`);
    }

    const destination = this.getDestination(method, session.user);
    const { twoFactor } = require2FA(session, {
      verify: codes,
      add: { method, destination, code: this.generateCode() },
      expiresAt: Date.now() + 15 * 60 * 60 * 1000,
    });
    const constraints = [...codes, twoFactor.add];
    this.notify.send(constraints, session.id);

    return constraints.map((c) => c.method);
  }

  async disable(methods: TwoFactorMethod[], session: SessionProxy) {
    const enabled = await this.settingsRepo.findBy({ user_id: session.user.id });
    if (enabled.length === 0) {
      throw new ConflictException('No 2FA methods are enabled');
    }
    const constraints = this.generate(enabled);
    require2FA(session, {
      verify: constraints,
      remove: methods.length ? methods : enabled.map((s) => s.method),
      expiresAt: Date.now() + 15 * 60 * 60 * 1000,
    });

    this.notify.send(constraints, session.id);

    return constraints.map((c) => c.method);
  }

  async resend(method: TwoFactorMethod, session: SessionProxy) {
    if (!is2FA(session)) {
      throw new ConflictException('No 2FA codes have been sent');
    }
    const sent = session.twoFactor.verify.find((c) => c.method === method);
    if (!sent) {
      throw new ConflictException(`2FA code for ${method} has not been sent`);
    }
    sent.code = this.generateCode();

    this.notify.send([sent], session.id);
  }

  async verify(codes: Array<{ code: number; method: string }>, session: SessionProxy) {
    if (!is2FA(session)) {
      throw new ConflictException('No verification required');
    }
    if (session.twoFactor.expiresAt < Date.now()) {
      return { valid: false, reason: '2FA session expired' };
    }

    let reason: string;
    const verifyCodes = () => {
      let valid = (session.twoFactor.verify ?? []).reduce((acc, c) => {
        const actual = codes.find((a) => a.method === c.method);

        return acc && !!actual && c.code === actual.code;
      }, true);

      if (valid && session.twoFactor.add) {
        const actual = codes.find((a) => a.method === session.twoFactor.add.method);

        valid = !!actual && session.twoFactor.add.code === actual.code;
      }

      return valid;
    };

    if (session.twoFactor.expiresAt < Date.now()) {
      reason = '2FA session expired';
    } else if (!verifyCodes()) {
      reason = '2FA code does not match';
    } else {
      if (session.twoFactor.add) {
        await this.settingsRepo.insert({
          user_id: session.user.id,
          method: session.twoFactor.add.method,
          destination: session.twoFactor.add.destination,
        });
      }
      if (session.twoFactor.remove) {
        await this.settingsRepo.delete({ user_id: session.user.id, method: In(session.twoFactor.remove) });
      }
      confirm2FA(session);
    }

    return { valid: !reason, reason };
  }

  async verifyOne(verification: { method: string; code: number }, session: SessionProxy) {
    if (!is2FA(session)) {
      throw new ConflictException('No verification required');
    }

    for (const { code, method } of session.twoFactor.verify ?? []) {
      if (verification.method === method) {
        if (verification.code === code) {
          confirm2FAMethod(session, method);
          await session.save();

          return { valid: true, unverified: { methods: (session.twoFactor.verify ?? []).map((c) => c.method) } };
        }

        return { valid: false, reason: '2FA code does not match' };
      }
    }

    return { valid: false, reason: `2FA for ${verification.method} has not been requested!` };
  }
}
