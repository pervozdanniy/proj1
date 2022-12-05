import { GrpcMethod } from '@nestjs/microservices';
import { Controller, UseFilters } from '@nestjs/common';

import { UserService } from '../services/user.service';
import { TypeOrmExceptionFilter } from '~command/filters/type-orm-exception.filter';

@Controller()
@UseFilters(TypeOrmExceptionFilter)
export class UserController {
  constructor(private usersService: UserService) {}

  @GrpcMethod('UserService', 'GetById')
  async getById(params) {
    return this.usersService.get(params.id);
  }
}
