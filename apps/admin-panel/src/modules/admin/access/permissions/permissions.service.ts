import { Pagination, PaginationRequest, PaginationResponseDto } from '@/libs/pagination';
import { Injectable, InternalServerErrorException, NotFoundException, RequestTimeoutException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TimeoutError } from 'rxjs';
import { Repository } from 'typeorm';
import { DBErrorCode } from '../../../../common/enums';
import { PermissionEntity } from '../permissions/permission.entity';
import { PermissionExistsException } from './../../../../common/http/exceptions';
import { CreatePermissionRequestDto, PermissionResponseDto, UpdatePermissionRequestDto } from './dtos';
import { PermissionMapper } from './permission.mapper';

@Injectable()
export class PermissionsService extends Repository<PermissionEntity> {
  constructor(@InjectRepository(PermissionEntity) permissionsRepository: Repository<PermissionEntity>) {
    super(PermissionEntity, permissionsRepository.manager, permissionsRepository.queryRunner);
  }

  /**
   * Get a paginated permission list
   * @param pagination {PaginationRequest}
   * @returns {Promise<PaginationResponseDto<PermissionResponseDto>>}
   */
  public async getPermissions(pagination: PaginationRequest): Promise<PaginationResponseDto<PermissionResponseDto>> {
    try {
      const [permissionEntities, totalPermissions] = await this.getPermissionsAndCount(pagination);

      const permissionDtos = await Promise.all(permissionEntities.map(PermissionMapper.toDto));

      return Pagination.of(pagination, totalPermissions, permissionDtos);
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
   * Get permission by id
   * @param id {number}
   * @returns {Promise<PermissionResponseDto>}
   */
  public async getPermissionById(id: number): Promise<PermissionResponseDto> {
    const permissionEntity = await this.findOne({ where: { id } });
    if (!permissionEntity) {
      throw new NotFoundException();
    }

    return PermissionMapper.toDto(permissionEntity);
  }

  /**
   * Create new permission
   * @param permissionDto {CreatePermissionRequestDto}
   * @returns {Promise<PermissionResponseDto>}
   */
  public async createPermission(permissionDto: CreatePermissionRequestDto): Promise<PermissionResponseDto> {
    try {
      let permissionEntity = PermissionMapper.toCreateEntity(permissionDto);
      permissionEntity = await this.save(permissionEntity);

      return PermissionMapper.toDto(permissionEntity);
    } catch (error) {
      if (error.code == DBErrorCode.PgUniqueConstraintViolation) {
        throw new PermissionExistsException(permissionDto.slug);
      }
      if (error instanceof TimeoutError) {
        throw new RequestTimeoutException();
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  /**
   * Update permission by id
   * @param id {number}
   * @param permissionDto {UpdatePermissionRequestDto}
   * @returns {Promise<PermissionResponseDto>}
   */
  public async updatePermission(id: number, permissionDto: UpdatePermissionRequestDto): Promise<PermissionResponseDto> {
    let permissionEntity = await this.findOne({ where: { id } });
    if (!permissionEntity) {
      throw new NotFoundException();
    }

    try {
      permissionEntity = PermissionMapper.toUpdateEntity(permissionEntity, permissionDto);
      permissionEntity = await this.save(permissionEntity);

      return PermissionMapper.toDto(permissionEntity);
    } catch (error) {
      if (error.code == DBErrorCode.PgUniqueConstraintViolation) {
        throw new PermissionExistsException('');
      }
      if (error instanceof TimeoutError) {
        throw new RequestTimeoutException();
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  /**
   * Get permision list
   * @param pagination {PaginationRequest}
   * @returns permissionEntities[] and totalPermissions
   */
  public async getPermissionsAndCount(
    pagination: PaginationRequest,
  ): Promise<[permissionEntities: PermissionEntity[], totalPermissions: number]> {
    const {
      skip,
      limit: take,
      order,
      params: { search },
    } = pagination;
    const query = this.createQueryBuilder().skip(skip).take(take).orderBy(order);

    if (search) {
      query.where('description ILIKE :search', {
        search: `%${search}%`,
      });
    }

    return query.getManyAndCount();
  }
}
