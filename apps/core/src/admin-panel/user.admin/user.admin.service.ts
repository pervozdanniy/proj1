import { UserEntity } from '@/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBase } from '~common/grpc/interfaces/admin_panel';
import { PaginationRequest } from '~common/interfaces/pagination';

@Injectable()
export class UserAdminService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  getUserById(id: number): Promise<UserEntity> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.documents', 'documents', 'documents.status = :status', { status: 'approved' })
      .leftJoinAndSelect('user.details', 'details')
      .leftJoinAndSelect('user.contacts', 'contacts')
      .where('user.id = :id', { id })
      .getOne();
  }

  getUserList(
    pagination: PaginationRequest<{ filter: { [key: string]: string[] | number[] } }>,
  ): Promise<[UserEntity[], number]> {
    const { skip: offset, limit, order } = pagination;
    const query = this.userRepository.createQueryBuilder('users').orderBy(order).offset(offset).limit(limit);

    if (pagination?.params?.filter) {
      for (const [key, values] of Object.entries(pagination.params.filter)) {
        if (values.length === 0) continue;
        // todo: Implement filter by date range
        query.andWhere(`(${values.map((value) => `CAST(users.${key} as varchar) ILIKE '%${value}%'`).join(' OR ')})`);
      }
    }

    return query.getManyAndCount();
  }

  updateUserStatus(user_id: number, status: string): Promise<UserBase> {
    return this.userRepository
      .createQueryBuilder('user')
      .update()
      .set({ status })
      .where('id = :user_id', { user_id })
      .returning('*')
      .execute()
      .then((result) => result.raw[0]);
  }
}
