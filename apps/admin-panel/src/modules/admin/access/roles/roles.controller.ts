import { ApiPaginatedResponse, PaginationParams, PaginationRequest, PaginationResponseDto } from '@/libs/pagination';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  ValidationPipe,
} from '@nestjs/common';
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
import { Permissions, TOKEN_NAME } from '../../../auth';
import { CreateRoleRequestDto, RoleResponseDto, UpdateRoleRequestDto } from './dtos';
import { RolesService } from './roles.service';

@ApiTags('Admin.Roles')
@ApiBearerAuth(TOKEN_NAME)
@Controller({
  path: 'access/roles',
  version: '1',
})
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @ApiOperation({ description: 'Get a paginated role list' })
  @ApiPaginatedResponse(RoleResponseDto)
  @ApiQuery({
    name: 'search',
    type: 'string',
    required: false,
    example: 'admin',
  })
  @Permissions(PM.access.roles.read)
  @Get()
  public getRoles(@PaginationParams() pagination: PaginationRequest): Promise<PaginationResponseDto<RoleResponseDto>> {
    return this.rolesService.getRoles(pagination);
  }

  @ApiOperation({ description: 'Get role by id' })
  @ApiGlobalResponse(RoleResponseDto)
  @Permissions(PM.access.roles.read)
  @Get('/:id')
  public getRoleById(@Param('id', ParseIntPipe) id: number): Promise<RoleResponseDto> {
    return this.rolesService.getRoleById(id);
  }

  @ApiOperation({ description: 'Create new role' })
  @ApiGlobalResponse(RoleResponseDto)
  @ApiConflictResponse({ description: 'Role already exists' })
  @Permissions(PM.access.roles.create)
  @Post()
  public createRole(@Body(ValidationPipe) roleDto: CreateRoleRequestDto): Promise<RoleResponseDto> {
    return this.rolesService.createRole(roleDto);
  }

  @ApiOperation({ description: 'Update role by id' })
  @ApiGlobalResponse(RoleResponseDto)
  @ApiConflictResponse({ description: 'Role already exists' })
  @Permissions(PM.access.roles.update)
  @Put('/:id')
  public updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) roleDto: UpdateRoleRequestDto,
  ): Promise<RoleResponseDto> {
    return this.rolesService.updateRole(id, roleDto);
  }

  @ApiOperation({ description: 'Delete role by id' })
  @ApiNoContentResponse()
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions(PM.access.roles.delete)
  @Delete('/:id')
  public deleteRole(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.rolesService.deleteRole(id);
  }
}
