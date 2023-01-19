import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { InjectGrpc } from '~common/grpc/helpers';
import { NotificationRequest, UpdateNotificationRequest } from '~common/grpc/interfaces/notification';
import { NotifierServiceClient } from '~common/grpc/interfaces/notifier';
import { NotificationEntity } from '~svc/core/src/notification/entities/notification.entity';

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);
  constructor(
    @InjectGrpc('notifier') private readonly client: ClientGrpc,
    @InjectRepository(NotificationEntity)
    private notificationEntityRepository: Repository<NotificationEntity>,
  ) {}

  private notifierService: NotifierServiceClient;

  onModuleInit() {
    this.notifierService = this.client.getService('NotifierService');
  }

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

  create(payload: { user_id: number; description: string; title: string; type: string }): void {
    this.notificationEntityRepository.save(this.notificationEntityRepository.create(payload)).catch((e) => {
      this.logger.error(e.message);
    });
  }

  send(notificationPayload, user_data) {
    firstValueFrom(this.notifierService.add({ notification: notificationPayload, user_data }))
      .then((data) => {
        return data;
      })
      .catch((e) => {
        this.logger.error(e);
      });
  }
}
