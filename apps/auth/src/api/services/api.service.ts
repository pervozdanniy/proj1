import { Auth2FAService } from '@/auth-2fa/2fa.service';
import { AuthService } from '@/auth/auth.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UserStatusEnum } from '~common/constants/user';
import { SessionProxy } from '~common/grpc-session';
import { AuthData } from '~common/grpc/interfaces/auth';
import { IdRequest, User } from '~common/grpc/interfaces/common';
import { NotifyRequest } from '~common/grpc/interfaces/notifier';

@Injectable()
export class AuthApiService {
  constructor(private readonly auth: AuthService, private readonly auth2FA: Auth2FAService) {}

  async validateUser(login: string, pass: string): Promise<User | null> {
    return this.auth.validateUser(login, pass);
  }

  async login(user: User, session: SessionProxy) {
    const resp: AuthData = await this.auth.login(user, session);
    const methods = await this.auth2FA.requireIfEnabled(session);
    if (methods.length) {
      resp.verify = { type: '2FA Verification', methods };
    }

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

  async refresh(token: string) {
    return this.auth.refreshToken(token);
  }

  async validate(token: string) {
    return this.auth.validateToken(token);
  }

  async closeAccount(session: SessionProxy): Promise<User> {
    if (session.user.status === UserStatusEnum.Closed) {
      throw new BadRequestException('User account has already closed!');
    }
    const user = await this.auth.updateUser({ id: session.user.id, status: UserStatusEnum.Closed });
    const notificationPayload: NotifyRequest = {
      title: 'User account',
      body: `Your account closed!`,
    };
    await this.auth.sendNotification(user.email, notificationPayload);
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

    const updatedUser = await this.auth.updateUser({ id, status: UserStatusEnum.Active });
    const notificationPayload: NotifyRequest = {
      title: 'User account',
      body: `Your account opened,please login again!`,
    };
    await this.auth.sendNotification(user.email, notificationPayload);

    return updatedUser;
  }
}
