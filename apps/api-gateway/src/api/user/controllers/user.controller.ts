import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { User } from '~common/grpc/interfaces/common';
import { JwtSessionAuth, JwtSessionUser } from '~common/session';
import { UpdateUserDto, UserContactsDto } from '~svc/api-gateway/src/api/user/dtos/update-user.dto';
import { PublicUserDto, PublicUserWithContactsDto } from '../../utils/public-user.dto';
import { CreateUserDTO } from '../dtos/create-user.dto';
import { RegistrationResponseDto } from '../dtos/user.dto';
import { UserService } from '../user.service';

@ApiTags('User')
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
  @JwtSessionAuth()
  @Get('current')
  async getCurrent(@JwtSessionUser() { id }: User) {
    const user = await this.userService.getById(id);

    return plainToInstance(PublicUserDto, user);
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: PublicUserWithContactsDto })
  @ApiNotFoundResponse()
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.getById(id);

    return plainToInstance(PublicUserWithContactsDto, user);
  }

  @ApiOperation({ summary: 'Create user.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The user created successfully.',
    type: RegistrationResponseDto,
  })
  @ApiConflictResponse()
  @HttpCode(HttpStatus.CREATED)
  @Post()
  createUser(@Body() payload: CreateUserDTO): Promise<RegistrationResponseDto> {
    return this.userService.create(payload);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user.' })
  @ApiResponse({
    description: 'The user updated successfully.',
    type: PublicUserDto,
  })
  @JwtSessionAuth()
  @Put()
  async update(@JwtSessionUser() { id }: User, @Body() payload: UpdateUserDto): Promise<PublicUserDto> {
    const request = { ...payload, id };
    const user = await this.userService.update(request);

    return plainToInstance(PublicUserDto, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user`s contacts.' })
  @ApiResponse({
    description: 'The user`s contacts created successfully.',
    type: PublicUserDto,
  })
  @JwtSessionAuth()
  @Patch('contacts')
  async updateContacts(@JwtSessionUser() { id }: User, @Body() payload: UserContactsDto): Promise<PublicUserDto> {
    const user = await this.userService.updateContacts(id, payload);

    return plainToInstance(PublicUserDto, user);
  }
}
