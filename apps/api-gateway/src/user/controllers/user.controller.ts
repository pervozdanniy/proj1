import { UserDTO } from '../dtos/user.dto';
import { CreateUserDTO } from '~svc/api-gateway/src/user/dtos/create-user.dto';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Injectable,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtSessionGuard, JwtSessionUser } from '~common/session';
import { UserService } from '../user.service';
import { PublicUserDto } from '../../utils/public-user.dto';
import { plainToInstance } from 'class-transformer';
import { User } from '~common/grpc/interfaces/common';

@ApiTags('User')
@Injectable()
@Controller({
  version: '1',
  path: 'users',
})
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get authorized user' })
  @ApiResponse({ status: HttpStatus.OK, type: PublicUserDto })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtSessionGuard)
  @Get('current')
  async getCurrent(@JwtSessionUser() { id }: User) {
    const user = await this.userService.getById(id);

    return plainToInstance(PublicUserDto, user);
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: PublicUserDto })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.getById(id);

    return plainToInstance(PublicUserDto, user);
  }

  @ApiOperation({ summary: 'Create user.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The user created successfully.',
    type: UserDTO,
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createUser(@Body() payload: CreateUserDTO): Promise<UserDTO> {
    return await this.userService.create(payload);
  }
}
