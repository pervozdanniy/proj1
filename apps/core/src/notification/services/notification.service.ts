import { UserService } from '@/user/services/user.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { InjectGrpc } from '~common/grpc/helpers';
import { NotificationRequest, UpdateNotificationRequest } from '~common/grpc/interfaces/notification';
import { NotifierServiceClient, NotifyOptions, NotifyRequest, SendType } from '~common/grpc/interfaces/notifier';
import { NotificationEntity } from '../entities/notification.entity';
import { WebSocketService } from './web-socket.service';

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);

  private notifierService: NotifierServiceClient;

  constructor(
    @InjectGrpc('notifier') private readonly client: ClientGrpc,
    @InjectRepository(NotificationEntity)
    private notificationEntityRepository: Repository<NotificationEntity>,
    private readonly ws: WebSocketService,

    private readonly userService: UserService,
  ) {}

  onModuleInit() {
    this.notifierService = this.client.getService('NotifierService');
  }

  async list(request: NotificationRequest) {
    const { offset, limit, read, id } = request;
    const queryBuilder = this.notificationEntityRepository.createQueryBuilder('n').where({ user_id: id });
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

  createAsync(payload: { user_id: number; description: string; title: string; type: string }) {
    this.create(payload).catch((e) => this.logger.error(e.message));
  }

  async create(payload: { user_id: number; description: string; title: string; type: string }): Promise<void> {
    const {
      phone,
      email,
      details: { send_type },
    } = await this.userService.getUserInfo(payload.user_id);

    const user_data: NotifyOptions = {
      phone,
      email,
      send_type: send_type as unknown as SendType,
    };

    await this.notificationEntityRepository.save(this.notificationEntityRepository.create(payload));

    const message = { body: payload.description, title: payload.title };
    await Promise.all([
      this.send(message, user_data),
      this.ws.sendTo({ event: 'notification', data: JSON.stringify(message) }, payload.user_id),
    ]);
  }

  send(notification: NotifyRequest, options: NotifyOptions) {
    return firstValueFrom(this.notifierService.add({ notification, options }));
  }
}
