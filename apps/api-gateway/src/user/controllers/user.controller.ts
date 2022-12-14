import {
  ClassSerializerInterceptor,
  Get,
  HttpCode,
  HttpStatus,
  Injectable,
  OnModuleInit,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { UserDTO } from '../dtos/user.dto';
import { InjectGrpc } from '~common/grpc/helpers';
import { UserServiceClient } from '~common/grpc/interfaces/core';
import { User } from '~common/grpc/interfaces/common';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { JwtSessionGuard, JwtSessionUser } from '~common/session';

@ApiTags('User')
@Injectable()
@UseInterceptors(ClassSerializerInterceptor)
@RpcController({
  version: '1',
  path: 'users',
})
export class UserController implements OnModuleInit {
  private userService: UserServiceClient;

  constructor(@InjectGrpc('core') private readonly core: ClientGrpc) {}

  async onModuleInit() {
    this.userService = this.core.getService('UserService');
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get authorized user' })
  @ApiResponse({ status: HttpStatus.OK, type: UserDTO })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtSessionGuard)
  @Get('current')
  getCurrent(@JwtSessionUser() { id }: User) {
    return firstValueFrom(this.userService.getById({ id }));
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: UserDTO })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async get(@Param('id') id: number) {
    return firstValueFrom(this.userService.getById({ id: Number(id) }));
  }
}
