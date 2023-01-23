import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SessionInterface, SessionService, TwoFactorSessionInterface } from '~common/session';
import { authenticate, is2FA, require2FA } from '~common/session/helpers';
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

  async requireIfEnabled(sessionId: string, session: SessionInterface) {
    const enabled = await this.getEnabled(session.user.id);
    if (enabled.length) {
      const codes = this.generate(enabled);
      await this.session.set(
        sessionId,
        require2FA(session, {
          verify: codes,
          expiresAt: Date.now() + 15 * 60 * 60 * 1000,
        }),
      );
      this.notify.send(codes, session.user.id);
    }
  }

  async getEnabled(userId: number) {
    const entities = await this.settingsRepo.find({ select: ['method'], where: { user_id: userId } });

    return entities.map((e) => e.method);
  }

  generateCode() {
    return Math.floor(100000 + Math.random() * 899999);
  }

  private generate(methods: TwoFactorMethod[]) {
    return methods.map((method) => ({
      method,
      code: this.generateCode(),
    }));
  }

  async enable(settings: BaseSettingsDto, sessionId: string) {
    const session = await this.session.get<TwoFactorSessionInterface>(sessionId);
    const enabled = await this.getEnabled(session.user.id);
    if (enabled.includes(settings.method)) {
      throw new BadRequestException(`2FA via "${settings.method}" is already enabled`);
    }
    const codes = this.generate(enabled);

    await this.session.set(
      sessionId,
      require2FA(session, {
        verify: codes,
        add: { method: settings.method, destination: settings.destination, code: this.generateCode() },
        expiresAt: Date.now() + 15 * 60 * 60 * 1000,
      }),
    );
    this.notify.send(
      [...codes, { code: session.twoFactor.add.code, method: session.twoFactor.add.method }],
      session.user.id,
    );
  }

  async disable(methods: TwoFactorMethod[], sessionId: string) {
    const session = await this.session.get(sessionId);
    const enabled = await this.getEnabled(session.user.id);
    const codes = this.generate(enabled);

    await this.session.set(
      sessionId,
      require2FA(session, {
        verify: codes,
        remove: methods.length ? methods : enabled,
        expiresAt: Date.now() + 15 * 60 * 60 * 1000,
      }),
    );
    this.notify.send(codes, session.user.id);
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
      await this.session.set(sessionId, authenticate(session));
    }

    return { valid: !reason, reason };
  }
}
