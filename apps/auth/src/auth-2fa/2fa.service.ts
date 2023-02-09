import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  confirm2FA,
  is2FA,
  PreRegisteredSessionInterface,
  require2FA,
  TwoFactorConstraint,
  TwoFactorSessionInterface,
} from '~common/constants/auth';
import { SessionInterface, SessionService } from '~common/session';
import { BaseSettingsDto } from '../api/dto/2fa.dto';
import { TwoFactorMethod, TwoFactorSettingsEntity } from '../entities/2fa_settings.entity';
import { Notifier2FAService } from './notifier.service';

@Injectable()
export class Auth2FAService {
  constructor(
    @InjectRepository(TwoFactorSettingsEntity) private readonly settingsRepo: Repository<TwoFactorSettingsEntity>,
    private readonly session: SessionService<SessionInterface | TwoFactorSessionInterface>,
    private readonly notify: Notifier2FAService,
  ) {}

  async requireConfirmation(sessionId: string, session: PreRegisteredSessionInterface) {
    const codes = this.generate([
      { method: TwoFactorMethod.Sms, destination: session.register.phone },
      { method: TwoFactorMethod.Email, destination: session.register.email },
    ]);
    await this.session.set(
      sessionId,
      require2FA(session, {
        verify: codes,
        expiresAt: Date.now() + 15 * 60 * 60 * 1000,
      }),
    );
    this.notify.send(codes, sessionId);

    return [TwoFactorMethod.Email, TwoFactorMethod.Sms];
  }

  async requireIfEnabled(sessionId: string, session: SessionInterface) {
    const enabled = await this.settingsRepo.findBy({ user_id: session.user.id });
    if (enabled.length) {
      const codes = this.generate(enabled);
      await this.session.set(
        sessionId,
        require2FA(session, {
          verify: codes,
          expiresAt: Date.now() + 15 * 60 * 60 * 1000,
        }),
      );
      this.notify.send(codes, sessionId);
    }

    return enabled.map((s) => s.method);
  }

  async requireOrFail(sessionId: string, session: SessionInterface) {
    const enabled = await this.requireIfEnabled(sessionId, session);
    if (enabled.length === 0) {
      throw new Error('No 2FA methods are enabled. Enable at least one to continue');
    }

    return enabled;
  }

  async getEnabled(userId: number) {
    const entities = await this.settingsRepo.find({ select: ['method'], where: { user_id: userId } });

    return entities.map((e) => e.method);
  }

  generateCode() {
    return Math.floor(100000 + Math.random() * 899999);
  }

  private generate(settings: Array<{ method: TwoFactorMethod; destination?: string }>): TwoFactorConstraint[] {
    return settings.map(({ method, destination }) => ({
      method,
      code: this.generateCode(),
      destination,
    }));
  }

  async enable(settings: BaseSettingsDto, sessionId: string) {
    const session = await this.session.get<TwoFactorSessionInterface>(sessionId);
    const enabled = await this.settingsRepo.findBy({ user_id: session.user.id });
    const codes = this.generate(enabled);
    if (enabled.findIndex((s) => s.method === settings.method) >= 0) {
      throw new ConflictException(`Method ${settings.method} is already enabled`);
    }

    await this.session.set(
      sessionId,
      require2FA(session, {
        verify: codes,
        add: { method: settings.method, destination: settings.destination, code: this.generateCode() },
        expiresAt: Date.now() + 15 * 60 * 60 * 1000,
      }),
    );
    this.notify.send([...codes, session.twoFactor.add], sessionId);
  }

  async disable(methods: TwoFactorMethod[], sessionId: string) {
    const session = await this.session.get(sessionId);
    const enabled = await this.settingsRepo.findBy({ user_id: session.user.id });
    if (enabled.length === 0) {
      throw new ConflictException('No 2FA methods are enabled');
    }
    const codes = this.generate(enabled);

    await this.session.set(
      sessionId,
      require2FA(session, {
        verify: codes,
        remove: methods.length ? methods : enabled.map((s) => s.method),
        expiresAt: Date.now() + 15 * 60 * 60 * 1000,
      }),
    );
    this.notify.send(codes, sessionId);
  }

  async verify(codes: Array<{ code: number; method: string }>, sessionId: string) {
    const session = await this.session.get(sessionId);
    if (!session || !is2FA(session)) {
      throw new ConflictException('No verification required');
    }
    let reason: string;
    const verifyCodes = () => {
      let valid = session.twoFactor.verify.reduce((acc, c) => {
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
      await this.session.set(sessionId, confirm2FA(session));
    }

    return { valid: !reason, reason };
  }
}
