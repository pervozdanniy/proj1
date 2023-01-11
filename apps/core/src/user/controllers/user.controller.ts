import { Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { User } from '~common/grpc/interfaces/common';
import {
  LoginRequest,
  NullableUser,
  UserServiceController,
  UserServiceControllerMethods,
} from '~common/grpc/interfaces/core';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { TypeOrmExceptionFilter } from '~common/utils/filters/type-orm-exception.filter';
import { IdRequestDto } from '../dto/id-request.dto';
import { CreateRequestDto, UpdateRequestDto } from '../dto/user-request.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserContactService } from '../services/user-contact.service';
import { UserService } from '../services/user.service';

@RpcController()
@UseFilters(TypeOrmExceptionFilter)
@UserServiceControllerMethods()
export class UserController implements UserServiceController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService, private readonly contactService: UserContactService) {}

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
  async update({ new_contacts, removed_contacts, ...payload }: UpdateRequestDto): Promise<User> {
    const user = await this.userService.update(payload);
    if (new_contacts.length || removed_contacts.length) {
      this.contactService
        .update(user, { new: new_contacts, removed: removed_contacts })
        .catch((error) => this.logger.error('Update user: contacts syncronization failed', error));
    }

    return plainToInstance(UserResponseDto, user);
  }
}
