import { ApiGlobalResponse } from '@adminCommon/decorators';
import { Permissions, SuperUserGuard, TOKEN_NAME } from '@auth';
import { ApiPaginatedResponse, PaginationParams, PaginationRequest, PaginationResponseDto } from '@libs/pagination';
import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiConflictResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreatePermissionRequestDto, PermissionResponseDto, UpdatePermissionRequestDto } from './dtos';
import { PermissionsService } from './permissions.service';

@ApiTags('Permissions')
@ApiBearerAuth(TOKEN_NAME)
@Controller({
  path: 'access/permissions',
  version: '1',
})
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}

  @ApiOperation({ description: 'Get a paginated permission list' })
  @ApiQuery({
    name: 'search',
    type: 'string',
    required: false,
    example: 'admin',
  })
  @ApiPaginatedResponse(PermissionResponseDto)
  @Permissions(
    'admin.access.permissions.read',
    'admin.access.permissions.create',
    'admin.access.permissions.update',
    'admin.access.roles.create',
    'admin.access.roles.update',
  )
  @Get()
  public getPermissions(
    @PaginationParams() pagination: PaginationRequest,
  ): Promise<PaginationResponseDto<PermissionResponseDto>> {
    return this.permissionsService.getPermissions(pagination);
  }

  @ApiOperation({ description: 'Get permission by id' })
  @ApiGlobalResponse(PermissionResponseDto)
  @Permissions(
    'admin.access.permissions.read',
    'admin.access.permissions.create',
    'admin.access.permissions.update',
    'admin.access.roles.create',
    'admin.access.roles.update',
  )
  @Get('/:id')
  public getPermissionById(@Param('id', ParseIntPipe) id: number): Promise<PermissionResponseDto> {
    return this.permissionsService.getPermissionById(id);
  }

  @ApiOperation({ description: 'Create new permission' })
  @ApiGlobalResponse(PermissionResponseDto)
  @ApiConflictResponse({ description: 'Permission already exists' })
  @UseGuards(SuperUserGuard)
  @Permissions('admin.access.permissions.create')
  @Post()
  public createPermission(
    @Body(ValidationPipe) permissionDto: CreatePermissionRequestDto,
  ): Promise<PermissionResponseDto> {
    return this.permissionsService.createPermission(permissionDto);
  }

  @ApiOperation({ description: 'Update permission by id' })
  @ApiGlobalResponse(PermissionResponseDto)
  @ApiConflictResponse({ description: 'Permission already exists' })
  @UseGuards(SuperUserGuard)
  @Permissions('admin.access.permissions.update')
  @Put('/:id')
  public updatePermission(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) permissionDto: UpdatePermissionRequestDto,
  ): Promise<PermissionResponseDto> {
    return this.permissionsService.updatePermission(id, permissionDto);
  }
}
