import { UserEntity } from '@/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationRequest } from '~common/libs/pagination/interfaces';

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

  getUserList(pagination: PaginationRequest): Promise<[UserEntity[], number]> {
    const { skip: offset, limit, order } = pagination;

    return this.userRepository.createQueryBuilder('user').orderBy(order).offset(offset).limit(limit).getManyAndCount();
  }
}
