import { NotificationDto } from '@/api/notification/dtos/notification.dto';
import { PaginatedNotificationsDto } from '@/api/notification/dtos/paginated-notifications.dto';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import {
  NotificationRequest,
  NotificationServiceClient,
  UpdateNotificationRequest,
} from '~common/grpc/interfaces/notification';

@Injectable()
export class NotificationService implements OnModuleInit {
  private notificationServiceClient: NotificationServiceClient;

  constructor(@InjectGrpc('core') private readonly core: ClientGrpc) {}

  onModuleInit() {
    this.notificationServiceClient = this.core.getService('NotificationService');
  }

  async list(data: NotificationRequest): Promise<PaginatedNotificationsDto> {
    return new PaginatedNotificationsDto(await lastValueFrom(this.notificationServiceClient.list(data)));
  }

  async update(data: UpdateNotificationRequest): Promise<NotificationDto> {
    return new NotificationDto(await lastValueFrom(this.notificationServiceClient.update(data)));
  }
}
