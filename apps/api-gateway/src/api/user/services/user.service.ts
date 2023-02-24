import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import crypto from 'node:crypto';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { User } from '~common/grpc/interfaces/common';
import { UpdateRequest, UserServiceClient } from '~common/grpc/interfaces/core';
import { UpdateUserDto, UserContactsDto } from '../dtos/update-user.dto';
import { S3Service } from './s3.service';

@Injectable()
export class UserService implements OnModuleInit {
  private userService: UserServiceClient;

  constructor(@InjectGrpc('core') private readonly core: ClientGrpc, private readonly s3: S3Service) {}

  onModuleInit() {
    this.userService = this.core.getService('UserService');
  }

  private withUrl(user: User): User {
    if (user.details?.avatar) {
      user.details.avatar = this.s3.getUrl(user.details.avatar);
    }

    return user;
  }

  async getById(id: number) {
    const user = await firstValueFrom(this.userService.getById({ id }));

    return this.withUrl(user);
  }

  async update({ avatar, ...request }: UpdateUserDto) {
    const payload: UpdateRequest = request;
    if (avatar) {
      const key = crypto.createHash('sha1').update(request.id.toString(), 'utf8').digest('hex');
      await this.s3.upload(key, avatar);
      payload.details = { ...payload.details, avatar: key };
    }
    const user = await firstValueFrom(this.userService.update(payload));

    return this.withUrl(user);
  }

  async updateContacts(id: number, contacts: UserContactsDto) {
    const user = await firstValueFrom(this.userService.updateContacts({ user_id: id, contacts }));

    return this.withUrl(user);
  }
}
