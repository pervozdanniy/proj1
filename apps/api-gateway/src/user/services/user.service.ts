import { HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import crypto from 'node:crypto';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { User } from '~common/grpc/interfaces/common';
import {
  RecepientsRequest,
  SearchContactRequest,
  UpdateRequest,
  UserServiceClient,
} from '~common/grpc/interfaces/core';
import { UpdateUserDto, UserContactsDto } from '../dtos/update-user.dto';
import { UploadAvatarDto } from '../dtos/upload-avatar.dto';
import { S3Service } from './s3.service';

@Injectable()
export class UserService implements OnModuleInit {
  private userService: UserServiceClient;

  constructor(@InjectGrpc('core') private readonly core: ClientGrpc, private readonly s3: S3Service) {}

  onModuleInit() {
    this.userService = this.core.getService('UserService');
  }

  withAvatarUrl(user: User): User;
  withAvatarUrl<T extends { avatar?: string }>(user: T): T;
  withAvatarUrl(user: any): any {
    if (user.details?.avatar) {
      user.details.avatar = this.s3.getUrl(user.details.avatar);
    }
    if (user.avatar) {
      user.avatar = this.s3.getUrl(user.avatar);
    }

    return user;
  }

  async getById(id: number) {
    const user = await firstValueFrom(this.userService.getById({ id }));

    return this.withAvatarUrl(user);
  }

  async update(request: UpdateUserDto) {
    const payload: UpdateRequest = request;
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

  async upload(id: number, { avatar }: UploadAvatarDto) {
    const timestamp = new Date().toISOString();
    const input = id.toString() + timestamp;
    const key = crypto.createHash('sha1').update(input, 'utf8').digest('hex');
    await this.s3.upload(key, avatar);

    const user = await firstValueFrom(this.userService.update({ id, details: { avatar: key } }));

    return this.withAvatarUrl(user);
  }

  async removeAvatar(id: number) {
    const current = await firstValueFrom(this.userService.getById({ id }));
    if (current.details.avatar) {
      await this.s3.delete(current.details.avatar);
      const user = await firstValueFrom(this.userService.update({ id, details: { avatar: '' } }));

      return this.withAvatarUrl(user);
    } else {
      throw new HttpException('User doesnt have an avatar!', HttpStatus.BAD_REQUEST);
    }
  }
}
