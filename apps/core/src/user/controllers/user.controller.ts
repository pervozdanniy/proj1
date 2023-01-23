import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { User } from '~common/grpc/interfaces/common';
import {
  LoginRequest,
  NullableUser,
  UserServiceController,
  UserServiceControllerMethods,
} from '~common/grpc/interfaces/core';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { IdRequestDto } from '../dto/id-request.dto';
import { CreateRequestDto, UpdateContactsRequestDto, UpdateRequestDto } from '../dto/user-request.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserContactService } from '../services/user-contact.service';
import { UserService } from '../services/user.service';

@RpcController()
@UserServiceControllerMethods()
export class UserController implements UserServiceController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService, private readonly contactService: UserContactService) {}

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateContacts(payload: UpdateContactsRequestDto): Promise<User> {
    const user = await this.userService.get(payload.user_id);
    await this.contactService.update(user, payload.contacts);

    const updated = await this.userService.get(payload.user_id);

    return plainToInstance(UserResponseDto, updated);
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create({ contacts, ...payload }: CreateRequestDto): Promise<User> {
    const user = await this.userService.create(payload);
    this.contactService
      .update(user, { new: contacts })
      .catch((error) => this.logger.error('Create user: contacts syncronization failed', error));

    return plainToInstance(UserResponseDto, user);
  }

  async findByLogin({ login }: LoginRequest): Promise<NullableUser> {
    const user = await this.userService.findByLogin(login);
    if (user) {
      return { user: plainToInstance(UserResponseDto, user) };
    }

    return {};
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getById({ id }: IdRequestDto): Promise<User> {
    const user = await this.userService.get(id);

    return plainToInstance(UserResponseDto, user);
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async delete({ id }: IdRequestDto) {
    const success = await this.userService.delete(id);
    this.contactService
      .detouch(id)
      .catch((error) => this.logger.error('Delete user: contacts syncronyzation failed', error));

    return { success };
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update({ contacts, ...payload }: UpdateRequestDto): Promise<User> {
    const user = await this.userService.update(payload);
    if (contacts) {
      this.contactService
        .update(user, contacts)
        .catch((error) => this.logger.error('Update user: contacts syncronization failed', error));
    }

    return plainToInstance(UserResponseDto, user);
  }
}
