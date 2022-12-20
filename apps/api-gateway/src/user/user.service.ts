import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { User } from '~common/grpc/interfaces/common';
import { UserServiceClient } from '~common/grpc/interfaces/core';
import bcrypt from 'bcrypt';
import { CreateUserDTO } from '~svc/api-gateway/src/user/dtos/create-user.dto';

@Injectable()
export class UserService implements OnModuleInit {
  private userService: UserServiceClient;

  constructor(@InjectGrpc('core') private readonly core: ClientGrpc) {}

  async onModuleInit() {
    this.userService = this.core.getService('UserService');
  }

  getById(id: number) {
    return firstValueFrom(this.userService.getById({ id }));
  }

  async findByLogin(login: string): Promise<User | undefined> {
    const { user } = await firstValueFrom(this.userService.findByLogin({ login }));

    return user;
  }

  async create(data: CreateUserDTO) {
    data.password = await bcrypt.hash(data.password, 10);

    return firstValueFrom(this.userService.create(data));
  }
}
