import { RolesService } from '@admin/access/roles/roles.service';
import { ApiGlobalResponse } from '@adminCommon/decorators';
import { Permissions, TOKEN_NAME } from '@auth';
import { ApiPaginatedResponse, PaginationParams, PaginationRequest, PaginationResponseDto } from '@libs/pagination';
import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiConflictResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateRoleRequestDto, RoleResponseDto, UpdateRoleRequestDto } from './dtos';

@ApiTags('Roles')
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
  @Permissions('admin.access.roles.read', 'admin.access.roles.create', 'admin.access.roles.update')
  @Get()
  public getRoles(@PaginationParams() pagination: PaginationRequest): Promise<PaginationResponseDto<RoleResponseDto>> {
    return this.rolesService.getRoles(pagination);
  }

  @ApiOperation({ description: 'Get role by id' })
  @ApiGlobalResponse(RoleResponseDto)
  @Permissions('admin.access.roles.read', 'admin.access.roles.create', 'admin.access.roles.update')
  @Get('/:id')
  public getRoleById(@Param('id', ParseIntPipe) id: number): Promise<RoleResponseDto> {
    return this.rolesService.getRoleById(id);
  }

  @ApiOperation({ description: 'Create new role' })
  @ApiGlobalResponse(RoleResponseDto)
  @ApiConflictResponse({ description: 'Role already exists' })
  @Permissions('admin.access.roles.create')
  @Post()
  public createRole(@Body(ValidationPipe) roleDto: CreateRoleRequestDto): Promise<RoleResponseDto> {
    return this.rolesService.createRole(roleDto);
  }

  @ApiOperation({ description: 'Update role by id' })
  @ApiGlobalResponse(RoleResponseDto)
  @ApiConflictResponse({ description: 'Role already exists' })
  @Permissions('admin.access.roles.update')
  @Put('/:id')
  public updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) roleDto: UpdateRoleRequestDto,
  ): Promise<RoleResponseDto> {
    return this.rolesService.updateRole(id, roleDto);
  }
}
