import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Injectable,
  OnModuleInit,
  Param,
  UseInterceptors,
} from '@nestjs/common';

import { ClientGrpc } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { lastValueFrom } from 'rxjs';
import { UserDTO } from '../dtos/user.dto';
import { UserService } from 'common/interfaces/user.interface';

@ApiTags('User')
@Injectable()
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: 'users',
})
export class UserController implements OnModuleInit {
  private userService: UserService;

  constructor(@Inject('user') private client: ClientGrpc) {}

  onModuleInit() {
    this.userService = this.client.getService('UserService');
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: UserDTO })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async get(@Param('id') id: number) {
    return lastValueFrom(this.userService.getById({ id: Number(id) }));
  }
}
