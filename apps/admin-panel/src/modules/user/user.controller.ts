import { ApiGlobalResponse } from '@/common/decorators';
import { ApiPaginatedResponse, PaginationParams, PaginationRequest, PaginationResponseDto } from '@/libs/pagination';
import { UserByIdResponseDto } from '@/modules/user/dtos/user-by-id-response.dto';
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PM } from '../../constants/permission/map.permission';
import { Permissions, TOKEN_NAME } from '../auth';
import { BaseUserResponseDto } from '../user/dtos/base-user-response.dto';
import { UserService } from '../user/user.service';

@ApiTags('Users')
@ApiBearerAuth(TOKEN_NAME)
@Controller({
  path: 'users',
  version: '1',
})
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ description: 'Get a paginated user list' })
  @ApiPaginatedResponse(BaseUserResponseDto)
  @Permissions(PM.users.read)
  @Get()
  public getUserList(
    @PaginationParams() pagination: PaginationRequest,
  ): Promise<PaginationResponseDto<BaseUserResponseDto>> {
    return this.userService.getUserList(pagination);
  }

  @ApiOperation({ description: 'Get a paginated user by id' })
  @ApiGlobalResponse(UserByIdResponseDto)
  @Permissions(PM.users.read)
  @Get(':id')
  public getUserById(@Param('id', ParseIntPipe) id: number): Promise<UserByIdResponseDto> {
    return this.userService.getUserById(id);
  }
}
