import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Injectable,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { User } from '~common/grpc/interfaces/common';
import { JwtSessionGuard, JwtSessionUser } from '~common/session';
import { CreateUserDTO } from '~svc/api-gateway/src/user/dtos/create-user.dto';
import { PublicUserDto } from '../../utils/public-user.dto';
import { RegistrationResponseDto } from '../dtos/user.dto';
import { UserService } from '../user.service';

@ApiTags('User')
@Injectable()
@Controller({
  version: '1',
  path: 'users',
})
@UseInterceptors(ClassSerializerInterceptor)
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
    let user;
    try {
      user = await this.userService.getById(id);
    } catch (error) {
      console.log(error);
    }

    return plainToInstance(PublicUserDto, user);
  }

  @ApiOperation({ summary: 'Create user.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The user created successfully.',
    type: RegistrationResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  createUser(@Body() payload: CreateUserDTO): Promise<RegistrationResponseDto> {
    return this.userService.create(payload);
  }
}
