import { DBErrorCode } from '@adminCommon/enums';
import { ForeignKeyConflictException, RoleExistsException } from '@adminCommon/http/exceptions';
import { Pagination, PaginationRequest, PaginationResponseDto } from '@libs/pagination';
import { Injectable, InternalServerErrorException, NotFoundException, RequestTimeoutException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TimeoutError } from 'rxjs';
import { CreateRoleRequestDto, RoleResponseDto, UpdateRoleRequestDto } from './dtos';
import { RoleMapper } from './role.mapper';
import { RolesRepository } from './roles.repository';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RolesRepository)
    private rolesRepository: RolesRepository,
  ) {}

  /**
   * Get a paginated role list
   * @param pagination {PaginationRequest}
   * @returns {Promise<PaginationResponseDto<RoleResponseDto>>}
   */
  public async getRoles(pagination: PaginationRequest): Promise<PaginationResponseDto<RoleResponseDto>> {
    try {
      const [roleEntities, totalRoles] = await this.rolesRepository.getRolesAndCount(pagination);

      const roleDtos = await Promise.all(roleEntities.map(RoleMapper.toDtoWithRelations));

      return Pagination.of(pagination, totalRoles, roleDtos);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException();
      }
      if (error instanceof TimeoutError) {
        throw new RequestTimeoutException();
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  /**
   * Get role by id
   * @param id {number}
   * @returns {Promise<RoleResponseDto>}
   */
  public async getRoleById(id: number): Promise<RoleResponseDto> {
    const roleEntity = await this.rolesRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!roleEntity) {
      throw new NotFoundException();
    }

    return RoleMapper.toDtoWithRelations(roleEntity);
  }

  /**
   * Create new role
   * @param roleDto {CreateRoleRequestDto}
   * @returns {Promise<RoleResponseDto>}
   */
  public async createRole(roleDto: CreateRoleRequestDto): Promise<RoleResponseDto> {
    try {
      let roleEntity = RoleMapper.toCreateEntity(roleDto);
      roleEntity = await this.rolesRepository.save(roleEntity);

      return RoleMapper.toDto(roleEntity);
    } catch (error) {
      if (error.code == DBErrorCode.PgUniqueConstraintViolation) {
        throw new RoleExistsException(roleDto.name);
      }
      if (
        error.code == DBErrorCode.PgForeignKeyConstraintViolation ||
        error.code == DBErrorCode.PgNotNullConstraintViolation
      ) {
        throw new ForeignKeyConflictException();
      }
      if (error instanceof TimeoutError) {
        throw new RequestTimeoutException();
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  /**
   * Update role by id
   * @param id {number}
   * @param roleDto {UpdateRoleRequestDto}
   * @returns {Promise<RoleResponseDto>}
   */
  public async updateRole(id: number, roleDto: UpdateRoleRequestDto): Promise<RoleResponseDto> {
    let roleEntity = await this.rolesRepository.findOne({ where: { id } });
    if (!roleEntity) {
      throw new NotFoundException();
    }

    try {
      roleEntity = RoleMapper.toUpdateEntity(roleEntity, roleDto);
      roleEntity = await this.rolesRepository.save(roleEntity);

      return RoleMapper.toDto(roleEntity);
    } catch (error) {
      if (error.code == DBErrorCode.PgUniqueConstraintViolation) {
        throw new RoleExistsException(roleDto.name);
      }
      if (
        error.code == DBErrorCode.PgForeignKeyConstraintViolation ||
        error.code == DBErrorCode.PgNotNullConstraintViolation
      ) {
        throw new ForeignKeyConflictException();
      }
      if (error instanceof TimeoutError) {
        throw new RequestTimeoutException();
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
