import { ConflictException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientGrpc } from '@nestjs/microservices';
import bcrypt from 'bcrypt';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { User } from '~common/grpc/interfaces/common';
import { UserServiceClient } from '~common/grpc/interfaces/core';
import {
  AuthenticatedSessionInterface,
  SessionInterface,
  SessionService,
  TwoFactorSessionInterface,
} from '~common/session';
import { is2FA } from '~common/session/helpers';
import { TwoFactorService } from './2fa.service';

@Injectable()
export class AuthApiService implements OnModuleInit {
  private logger = new Logger(AuthApiService.name);
  private userService: UserServiceClient;

  constructor(
    @InjectGrpc('core') private readonly client: ClientGrpc,
    private readonly jwt: JwtService,
    private readonly session: SessionService<SessionInterface>,
    private readonly twoFactor: TwoFactorService,
  ) {}

  onModuleInit() {
    this.userService = this.client.getService('UserService');
  }

  async validateUser(login: string, pass: string): Promise<User | null> {
    let user: User | undefined;
    try {
      user = await this.findByLogin(login);
    } catch (error) {
      this.logger.error('Validate user: ', error.stack, { error });
    }
    if (user) {
      const isEq = await bcrypt.compare(pass, user.password);
      if (isEq) {
        delete user.password;

        return user;
      }
    }

    return null;
  }

  async validate2FA(codes: Array<{ code: number; method: string }>, sessionId: string) {
    const session = await this.session.get(sessionId);
    if (!session || !is2FA(session)) {
      throw new ConflictException('No verification required');
    }
    let reason: string;

    if (session.twoFactor.expiresAt < Date.now()) {
      reason = '2FA code expired';
    } else if (
      !session.twoFactor.verify.reduce((acc, c) => {
        const actual = codes.find((a) => a.method === c.method);

        return acc && !!actual && c.code === actual.code;
      }, true)
    ) {
      reason = '2FA code does not match';
    } else {
      await this.session.set(sessionId, { user: session.user, isAuthenticated: true });
    }

    return { valid: !!reason, reason };
  }

  async findByLogin(login: string) {
    const { user } = await firstValueFrom(this.userService.findByLogin({ login }));

    return user;
  }

  async login(user: User) {
    const sessionId = await this.session.generate();
    let session: AuthenticatedSessionInterface | TwoFactorSessionInterface;
    const methods = await this.twoFactor.getEnabled(user.id);
    if (methods.length) {
      const codes = methods.map((method) => ({
        method,
        code: this.twoFactor.generateCode(),
      }));
      session = {
        user,
        isAuthenticated: false,
        twoFactor: { verify: codes, expiresAt: Date.now() + 15 * 60 * 60 * 1000 },
      };
    } else {
      session = { user, isAuthenticated: true };
    }
    await this.session.set(sessionId, session);

    return {
      access_token: await this.jwt.signAsync({ sub: sessionId }),
      session_id: sessionId,
    };
  }

  async findUser(id: number) {
    return firstValueFrom(this.userService.getById({ id }));
  }
}
