import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { UserServiceClient } from '~common/grpc/interfaces/core';
import { UpdateUserDto, UserContactsDto } from './dtos/update-user.dto';

@Injectable()
export class UserService implements OnModuleInit {
  private userService: UserServiceClient;

  constructor(@InjectGrpc('core') private readonly core: ClientGrpc) {}

  onModuleInit() {
    this.userService = this.core.getService('UserService');
  }

  getById(id: number) {
    return firstValueFrom(this.userService.getById({ id }));
  }

  update(request: UpdateUserDto) {
    return firstValueFrom(this.userService.update(request));
  }

  updateContacts(id: number, contacts: UserContactsDto) {
    return firstValueFrom(this.userService.updateContacts({ user_id: id, contacts }));
  }
}
