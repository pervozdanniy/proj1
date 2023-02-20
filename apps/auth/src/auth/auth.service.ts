import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientGrpc } from '@nestjs/microservices';
import bcrypt from 'bcrypt';
import { firstValueFrom } from 'rxjs';
import { SessionProxy } from '~common/grpc-session';
import { InjectGrpc } from '~common/grpc/helpers';
import { RegisterStartRequest } from '~common/grpc/interfaces/auth';
import { User } from '~common/grpc/interfaces/common';
import { CreateRequest, UpdateRequest, UserServiceClient } from '~common/grpc/interfaces/core';

@Injectable()
export class AuthService implements OnModuleInit {
  private logger = new Logger(AuthService.name);
  private userService: UserServiceClient;

  constructor(@InjectGrpc('core') private readonly client: ClientGrpc, private readonly jwt: JwtService) {}

  onModuleInit() {
    this.userService = this.client.getService('UserService');
  }

  async validateUser(login: string, pass: string): Promise<User | null> {
    let user: User | undefined;
    try {
      user = await this.findByEmail(login);
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

  async findByEmail(email: string) {
    const { user } = await firstValueFrom(this.userService.findByLogin({ email }));

    return user;
  }

  async findByPhone(phone: string) {
    const { user } = await firstValueFrom(this.userService.findByLogin({ phone }));

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

  createUser(payload: CreateRequest) {
    return firstValueFrom(this.userService.create(payload));
  }

  updateUser(payload: UpdateRequest) {
    return firstValueFrom(this.userService.update(payload));
  }

  login(user: User, session: SessionProxy) {
    session.user = user;

    return this.generateToken(session.id);
  }

  generateToken(sessionId: string) {
    return this.jwt.signAsync({ sub: sessionId });
  }
}
