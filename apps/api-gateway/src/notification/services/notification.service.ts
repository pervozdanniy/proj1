import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import {
  Notification,
  NotificationListResponse,
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

  list(data: NotificationRequest): Observable<NotificationListResponse> {
    return this.notificationServiceClient.list(data);
  }

  update(data: UpdateNotificationRequest): Observable<Notification> {
    return this.notificationServiceClient.update(data);
  }
}
