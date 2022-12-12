import { Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { InjectGrpc } from '~common/grpc/helpers';
import { UserServiceClient } from '~common/grpc/interfaces/core';
import bcrypt from 'bcrypt';
import { firstValueFrom } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { AuthorizedUser } from '~common/grpc/auth';

@Injectable()
export class AuthService {
  private userService: UserServiceClient;

  constructor(@InjectGrpc('core') private readonly client: ClientGrpc, private readonly jwt: JwtService) {}

  onModuleInit() {
    this.userService = this.client.getService('UserService');
  }

  async validateUser(login: string, pass: string): Promise<AuthorizedUser | null> {
    const user = await firstValueFrom(this.userService.findByLogin({ login }));

    if (user) {
      const isEq = await bcrypt.compare(pass, user.password);
      if (!user.password || isEq) {
        return { id: user.id, username: user.username };
      }
    }

    return null;
  }

  async login(user: AuthorizedUser) {
    const payload = { username: user.username, sub: user.id };

    return {
      access_token: this.jwt.sign(payload),
    };
  }

  async findUser(id: number) {
    return firstValueFrom(this.userService.getById({ id }));
  }
}
