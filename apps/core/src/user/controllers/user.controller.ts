import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
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
<<<<<<< HEAD
import { AuthUserResponseDto } from '../dto/auth-user-response.dto';
import { CreateRequestDto } from '../dto/create-request.dto';
import { IdRequestDto } from '../dto/id-request.dto';
import { UserResponseDto } from '../dto/user-response.dto';
=======
import { CreateRequestDto } from '../dto/create.request.dto';
import { IdRequestDto } from '../dto/id.request.dto';
import { UserResponseDto } from '../dto/user.response.dto';
>>>>>>> 492ba48 (SKOPA-99: added integration tests)
import { UserService } from '../services/user.service';

@RpcController()
@UseFilters(TypeOrmExceptionFilter)
@UserServiceControllerMethods()
export class UserController implements UserServiceController {
  constructor(private userService: UserService) {}

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(payload: CreateRequestDto): Promise<User> {
    const user = await this.userService.create(payload);

    return plainToInstance(UserResponseDto, user);
  }

  async findByLogin({ login }: LoginRequest): Promise<NullableUser> {
    const user = await this.userService.findByLogin(login);
    if (user) {
      return { user: plainToInstance(AuthUserResponseDto, user) };
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

    return { success };
  }
}
