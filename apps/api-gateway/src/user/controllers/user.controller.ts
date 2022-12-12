import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Injectable,
  OnModuleInit,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { UserDTO } from '../dtos/user.dto';
import { InjectGrpc } from '~common/grpc/helpers';
import { UserServiceClient } from '~common/grpc/interfaces/core';

@ApiTags('User')
@Injectable()
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: 'users',
})
export class UserController implements OnModuleInit {
  private userService: UserServiceClient;

  constructor(@InjectGrpc('core') private readonly core: ClientGrpc) {}

  async onModuleInit() {
    this.userService = this.core.getService('UserService');
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: UserDTO })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async get(@Param('id') id: number) {
    return firstValueFrom(this.userService.getById({ id: Number(id) }));
  }
}
