import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Notification,
  NotificationListResponse,
  NotificationRequest,
  UpdateNotificationRequest,
} from '~common/grpc/interfaces/notification';
import { NotificationEntity } from '../entities/notification.entity';
import { NotificationEvent } from '../interfaces/event.interface';
import { WebSocketService } from './web-socket.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(NotificationEntity)
    private notificationEntityRepository: Repository<NotificationEntity>,
    private readonly ws: WebSocketService,
  ) {}

  async list(request: NotificationRequest): Promise<NotificationListResponse> {
    const { search_after, limit, read, id } = request;
    const queryBuilder = this.notificationEntityRepository.createQueryBuilder('n').where({ user_id: id });
    if (search_after) {
      queryBuilder.where('n.id < :search_after', { search_after });
    }
    if (read !== undefined) {
      queryBuilder.where({ read });
    }
    queryBuilder.select(['n.*']).orderBy('n.id', 'DESC');
    const notifications = await queryBuilder.limit(limit + 1).getRawMany();

    let has_more = false;
    let last_id = 0;

    if (notifications.length > limit) {
      has_more = true;
      notifications.splice(-1);
      const { id } = notifications.at(-1);
      last_id = id;
    }

    return {
      last_id,
      notifications,
      has_more,
    };
  }

  async update(request: UpdateNotificationRequest): Promise<Notification> {
    const {
      payload: { id, read },
    } = request;

    await this.notificationEntityRepository.update({ id }, { read });

    const notificationEntity = await this.notificationEntityRepository.findOneBy({
      id,
    });

    return {
      id: notificationEntity.id,
      type: notificationEntity.type,
      payload: notificationEntity.payload,
      read: notificationEntity.read,
      created_at: notificationEntity.created_at.toString(),
    };
  }

  createAsync(userId: number, payload: NotificationEvent) {
    this.create(userId, payload).catch((e) => this.logger.error(e.message));
  }

  async create(userId: number, payload: NotificationEvent): Promise<void> {
    // const {
    //   phone,
    //   email,
    //   details: { send_type },
    // } = await this.userService.getUserInfo(userId);

    // const user_data: NotifyOptions = {
    //   phone,
    //   email,
    //   send_type: send_type as unknown as SendType,
    // };

    await Promise.all([
      this.notificationEntityRepository.save(this.notificationEntityRepository.create(payload)),
      this.ws.sendTo({ event: 'notification', data: JSON.stringify(payload) }, userId),
    ]);
  }
}
