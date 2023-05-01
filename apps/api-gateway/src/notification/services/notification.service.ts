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

  list(data: NotificationRequest) {
    return lastValueFrom(this.notificationServiceClient.list(data));
  }

  async update(data: UpdateNotificationRequest) {
    return lastValueFrom(this.notificationServiceClient.update(data));
  }
}
