import { Pagination, PaginationRequest, PaginationResponseDto } from '@/libs/pagination';
import { Injectable, InternalServerErrorException, NotFoundException, RequestTimeoutException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TimeoutError } from 'rxjs';
import { Repository } from 'typeorm';
import { DBErrorCode } from '../../../../common/enums';
import { ForeignKeyConflictException, RoleExistsException } from '../../../../common/http/exceptions';
import { RoleEntity } from '../roles/role.entity';
import { CreateRoleRequestDto, RoleResponseDto, UpdateRoleRequestDto } from './dtos';
import { RoleMapper } from './role.mapper';

@Injectable()
export class RolesService extends Repository<RoleEntity> {
  constructor(@InjectRepository(RoleEntity) rolesRepository: Repository<RoleEntity>) {
    super(RoleEntity, rolesRepository.manager, rolesRepository.queryRunner);
  }

  /**
   * Get a paginated role list
   * @param pagination {PaginationRequest}
   * @returns {Promise<PaginationResponseDto<RoleResponseDto>>}
   */
  public async getRoles(pagination: PaginationRequest): Promise<PaginationResponseDto<RoleResponseDto>> {
    try {
      const [roleEntities, totalRoles] = await this.getRolesAndCount(pagination);

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
    const roleEntity = await this.findOne({
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
      roleEntity = await this.save(roleEntity);
      roleEntity = await this.findOneOrFail({ where: { id: roleEntity.id }, relations: ['permissions'] });

      return RoleMapper.toDtoWithRelations(roleEntity);
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
    let roleEntity = await this.findOne({ where: { id } });
    if (!roleEntity) {
      throw new NotFoundException();
    }

    try {
      roleEntity = RoleMapper.toUpdateEntity(roleEntity, roleDto);
      roleEntity = await this.save(roleEntity);
      roleEntity = await this.findOneOrFail({ where: { id: roleEntity.id }, relations: ['permissions'] });

      return RoleMapper.toDtoWithRelations(roleEntity);
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
   * Delete role by id
   * @param id {number}
   * @returns {Promise<void>}
   */
  public async deleteRole(id: number): Promise<void> {
    const roleEntity = await this.findOne({ where: { id } });
    if (!roleEntity) {
      throw new NotFoundException();
    }

    try {
      await this.remove(roleEntity);
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new RequestTimeoutException();
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  /**
   * Get roles list
   * @param pagination {PaginationRequest}
   * @returns [roleEntities: RoleEntity[], totalRoles: number]
   */
  public async getRolesAndCount(
    pagination: PaginationRequest,
  ): Promise<[roleEntities: RoleEntity[], totalRoles: number]> {
    const {
      skip,
      limit: take,
      order,
      params: { search },
    } = pagination;
    const query = this.createQueryBuilder('r')
      .innerJoinAndSelect('r.permissions', 'p')
      .skip(skip)
      .take(take)
      .orderBy(order);

    if (search) {
      query.where('name ILIKE :search', { search: `%${search}%` });
    }

    return query.getManyAndCount();
  }
}
