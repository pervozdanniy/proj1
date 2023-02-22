import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import crypto from 'node:crypto';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
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

  getById(id: number) {
    return firstValueFrom(this.userService.getById({ id }));
  }

  async update({ avatar, ...request }: UpdateUserDto) {
    const payload: UpdateRequest = request;
    if (avatar) {
      const key = crypto.createHash('sha1').update(request.id.toString(), 'utf8').digest('hex');
      await this.s3.upload(key, avatar);
      payload.details = { ...payload.details, avatar: key };
    }

    return firstValueFrom(this.userService.update(payload));
  }

  updateContacts(id: number, contacts: UserContactsDto) {
    return firstValueFrom(this.userService.updateContacts({ user_id: id, contacts }));
  }
}
