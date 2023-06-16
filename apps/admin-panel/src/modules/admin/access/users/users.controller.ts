import { ApiPaginatedResponse, PaginationParams, PaginationRequest, PaginationResponseDto } from '@/libs/pagination';
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, ValidationPipe } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ApiGlobalResponse } from '../../../../common/decorators';
import { PM } from '../../../../constants/permission/map.permission';
import { CurrentUser, Permissions, TOKEN_NAME } from '../../../auth';
import { ChangePasswordRequestDto, CreateUserRequestDto, UpdateUserRequestDto, UserResponseDto } from './dtos';
import { UserEntity } from './user.entity';
import { UsersService } from './users.service';

@ApiTags('Admin.Users')
@ApiBearerAuth(TOKEN_NAME)
@Controller({
  path: 'access/users',
  version: '1',
})
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ description: 'Get a paginated user list' })
  @ApiPaginatedResponse(UserResponseDto)
  @ApiQuery({
    name: 'search',
    type: 'string',
    required: false,
    example: 'admin',
  })
  @Permissions(PM.access.users.read)
  @Get()
  public getUsers(@PaginationParams() pagination: PaginationRequest): Promise<PaginationResponseDto<UserResponseDto>> {
    return this.usersService.getUsers(pagination);
  }

  @ApiOperation({ description: 'Get user by id' })
  @ApiGlobalResponse(UserResponseDto)
  @Permissions(PM.access.users.read)
  @Get('/:id')
  public getUserById(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
    return this.usersService.getUserById(id);
  }

  @ApiOperation({ description: 'Create new user' })
  @ApiGlobalResponse(UserResponseDto)
  @ApiConflictResponse({ description: 'User already exists' })
  @ApiGlobalResponse(UserResponseDto)
  @Permissions(PM.access.users.create)
  @Post()
  public createUser(@Body(ValidationPipe) UserDto: CreateUserRequestDto): Promise<UserResponseDto> {
    return this.usersService.createUser(UserDto);
  }

  @ApiOperation({ description: 'Update user by id' })
  @ApiGlobalResponse(UserResponseDto)
  @ApiConflictResponse({ description: 'User already exists' })
  @Permissions(PM.access.users.update)
  @Put('/:id')
  public updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) UserDto: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateUser(id, UserDto);
  }

  @ApiOperation({ description: 'Delete user by id' })
  @ApiNoContentResponse()
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @Permissions(PM.access.users.delete)
  @Delete('/:id')
  public deleteUser(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.usersService.deleteUser(id);
  }

  @ApiOperation({ description: 'Change user password' })
  @ApiGlobalResponse(UserResponseDto)
  @Post('/change/password')
  changePassword(
    @Body(ValidationPipe) changePassword: ChangePasswordRequestDto,
    @CurrentUser() user: UserEntity,
  ): Promise<UserResponseDto> {
    return this.usersService.changePassword(changePassword, user.id);
  }
}
