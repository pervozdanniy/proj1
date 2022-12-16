import { Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { InjectGrpc } from '~common/grpc/helpers';
import { UserServiceClient } from '~common/grpc/interfaces/core';
import bcrypt from 'bcrypt';
import { firstValueFrom } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { SessionService } from '~common/session';
import { User } from '~common/grpc/interfaces/common';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  private userService: UserServiceClient;

  constructor(
    @InjectGrpc('core') private readonly client: ClientGrpc,
    private readonly jwt: JwtService,
    private readonly session: SessionService,
  ) {}

  onModuleInit() {
    this.userService = this.client.getService('UserService');
  }

  async validateUser(login: string, pass: string): Promise<User | null> {
    let user: User | undefined;
    try {
      const resp = await firstValueFrom(this.userService.findByLogin({ login }));
      user = resp.user;
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

  async login(user: User) {
    const sessionId = await this.session.generate();
    const session = { user };
    await this.session.set(sessionId, session);

    return {
      access_token: await this.jwt.signAsync({ sub: sessionId }),
    };
  }

  async findUser(id: number) {
    return firstValueFrom(this.userService.getById({ id }));
  }
}
