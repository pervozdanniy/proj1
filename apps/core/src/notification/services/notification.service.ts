import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationRequest, UpdateNotificationRequest } from '~common/grpc/interfaces/notification';
import { NotificationEntity } from '~svc/core/src/notification/entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationEntity)
    private notificationEntityRepository: Repository<NotificationEntity>,
  ) {}

  async list(request: NotificationRequest) {
    const { offset, limit, read } = request;
    const queryBuilder = this.notificationEntityRepository.createQueryBuilder('n');
    if (read !== undefined) {
      queryBuilder.where({ read });
    }
    const [items, count] = await queryBuilder.skip(offset).take(limit).getManyAndCount();

    return {
      items,
      count,
    };
  }

  async update(request: UpdateNotificationRequest): Promise<NotificationEntity> {
    const {
      payload: { id, read },
    } = request;
    const notification = await this.notificationEntityRepository.findOneByOrFail({ id });

    return this.notificationEntityRepository.save({ ...notification, read });
  }

  async create(payload: {
    user_id: number;
    description: string;
    title: string;
    type: string;
  }): Promise<NotificationEntity> {
    return await this.notificationEntityRepository.save(this.notificationEntityRepository.create(payload));
  }
}
