import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom, Observable } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import {
  Notification,
  NotificationListResponse,
  NotificationRequest,
  NotificationServiceClient,
  UpdateNotificationRequest,
} from '~common/grpc/interfaces/notification';
import { NotificationDto } from '~svc/api-gateway/src/notification/dtos/notification.dto';
import { PaginatedNotificationsDto } from '~svc/api-gateway/src/notification/dtos/paginated-notifications.dto';

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
