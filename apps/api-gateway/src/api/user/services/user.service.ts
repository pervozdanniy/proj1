import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import crypto from 'node:crypto';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { User } from '~common/grpc/interfaces/common';
import {
  Contact,
  RecepientsRequest,
  SearchContactRequest,
  UpdateRequest,
  UserServiceClient,
} from '~common/grpc/interfaces/core';
import { UpdateUserDto, UserContactsDto } from '../dtos/update-user.dto';
import { S3Service } from './s3.service';

@Injectable()
export class UserService implements OnModuleInit {
  private userService: UserServiceClient;

  constructor(@InjectGrpc('core') private readonly core: ClientGrpc, private readonly s3: S3Service) {}

  onModuleInit() {
    this.userService = this.core.getService('UserService');
  }

  private withAvatarUrl(user: User): User;
  private withAvatarUrl(user: Contact): Contact;
  private withAvatarUrl(user: any): any {
    if (user.details?.avatar) {
      user.details.avatar = this.s3.getUrl(user.details.avatar);
    }
    if (user.avatar) {
      user.avatar = this.s3.getUrl(user.details.avatar);
    }

    return user;
  }

  async getById(id: number) {
    const user = await firstValueFrom(this.userService.getById({ id }));

    return this.withAvatarUrl(user);
  }

  async update({ avatar, ...request }: UpdateUserDto) {
    const payload: UpdateRequest = request;
    if (avatar) {
      const key = crypto.createHash('sha1').update(request.id.toString(), 'utf8').digest('hex');
      await this.s3.upload(key, avatar);
      payload.details = { ...payload.details, avatar: key };
    }
    const user = await firstValueFrom(this.userService.update(payload));

    return this.withAvatarUrl(user);
  }

  async updateContacts(id: number, contacts: UserContactsDto) {
    const user = await firstValueFrom(this.userService.updateContacts({ user_id: id, contacts }));

    return this.withAvatarUrl(user);
  }

  async getContacts(data: SearchContactRequest) {
    const resp = await lastValueFrom(this.userService.getContacts(data));
    resp.contacts = resp.contacts.map((c) => this.withAvatarUrl(c));

    return resp;
  }

  async getLatestRecepients(data: RecepientsRequest) {
    const resp = await lastValueFrom(this.userService.getLatestRecepients(data));
    resp.recepients = resp.recepients.map((r) => this.withAvatarUrl(r));

    return resp;
  }
}
