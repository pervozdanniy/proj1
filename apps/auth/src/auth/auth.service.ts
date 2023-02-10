import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientGrpc } from '@nestjs/microservices';
import bcrypt from 'bcrypt';
import { firstValueFrom } from 'rxjs';
import { SessionInterface, SessionService } from '~common/grpc-session';
import { InjectGrpc } from '~common/grpc/helpers';
import { RegisterStartRequest } from '~common/grpc/interfaces/auth';
import { User } from '~common/grpc/interfaces/common';
import { CreateRequest, UserServiceClient } from '~common/grpc/interfaces/core';
import { AuthApiService } from '../api/services/api.service';

@Injectable()
export class AuthService implements OnModuleInit {
  private logger = new Logger(AuthApiService.name);
  private userService: UserServiceClient;

  constructor(
    @InjectGrpc('core') private readonly client: ClientGrpc,
    private readonly jwt: JwtService,
    private readonly session: SessionService<SessionInterface>,
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

  async findByLogin(login: string) {
    const { user } = await firstValueFrom(this.userService.findByLogin({ login }));

    return user;
  }

  async findUser(id: number) {
    return firstValueFrom(this.userService.getById({ id }));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async checkIfUnique({ password, ...payload }: RegisterStartRequest) {
    const { success } = await firstValueFrom(this.userService.checkIfUnique(payload));

    return success;
  }

  async createUser(payload: CreateRequest) {
    return firstValueFrom(this.userService.create(payload));
  }

  async generateSession(data: SessionInterface) {
    const sessionId = await this.session.generate();
    await this.session.set(sessionId, data);

    return sessionId;
  }

  async login(user: User) {
    const session = { user };
    const sessionId = await this.generateSession(session);

    return {
      sessionId,
      session,
    };
  }

  logout(sessionId: string) {
    return this.session.destroy(sessionId);
  }

  generateToken(sessionId: string) {
    return this.jwt.signAsync({ sub: sessionId });
  }
}
