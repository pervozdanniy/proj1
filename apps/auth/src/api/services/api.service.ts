import { ConflictException, Injectable, Logger, OnModuleInit, PreconditionFailedException } from '@nestjs/common';
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
  TwoFactorRequiredSessionInterface,
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

    if (session && is2FA(session)) {
      session.verify.codes.reduce((acc, c) => {
        const actual = codes.find((a) => a.method === c.method);

        return acc && !!actual && c.code === actual.code;
      }, true);
      if (session.verify.expiresAt < Date.now()) {
        throw new PreconditionFailedException('2FA code expired');
      }

      const codesValid = session.verify.codes.reduce((acc, c) => {
        const actual = codes.find((a) => a.method === c.method);

        return acc && !!actual && c.code === actual.code;
      }, true);
      if (!codesValid) {
        throw new PreconditionFailedException('2FA code does not match');
      }

      await this.session.set(sessionId, { user: session.user, isAuthenticated: true });

      return {
        access_token: await this.jwt.signAsync({ sub: sessionId }),
        session_id: sessionId,
      };
    }

    throw new ConflictException('No verification required');
  }

  async findByLogin(login: string) {
    const { user } = await firstValueFrom(this.userService.findByLogin({ login }));

    return user;
  }

  async login(user: User) {
    const sessionId = await this.session.generate();
    let session: AuthenticatedSessionInterface | TwoFactorRequiredSessionInterface;
    const methods = await this.twoFactor.getEnabled(user.id);
    if (methods.length) {
      const codes = methods.map((method) => ({
        method,
        code: this.twoFactor.generateCode(),
      }));
      session = { user, isAuthenticated: false, verify: { codes, expiresAt: Date.now() + 15 * 60 * 60 * 1000 } };
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
