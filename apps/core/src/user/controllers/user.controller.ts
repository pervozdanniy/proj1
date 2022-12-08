import { Controller, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { TypeOrmExceptionFilter } from 'common/filters/type-orm-exception.filter';
import { CreateRequestDto } from '../dto/create.request.dto';
import { IdRequestDto } from '../dto/id.request.dto';
import { LoginRequest, User, UserServiceController, UserServiceControllerMethods } from '~common/grpc/interfaces/core';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../dto/user.response.dto';

@Controller()
@UseFilters(TypeOrmExceptionFilter)
@UserServiceControllerMethods()
export class UserController implements UserServiceController {
  constructor(private userService: UserService) {}
  async findByLogin({ login }: LoginRequest): Promise<User | null> {
    const user = await this.userService.findByLogin(login);

    return user ? plainToInstance(UserResponseDto, user) : null;
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getById({ id }: IdRequestDto): Promise<User> {
    const user = await this.userService.get(id);

    return plainToInstance(UserResponseDto, user);
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(payload: CreateRequestDto): Promise<User> {
    const user = await this.userService.create(payload);

    return plainToInstance(UserResponseDto, user);
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async delete({ id }: IdRequestDto) {
    const success = await this.userService.delete(id);

    return { success };
  }
}
