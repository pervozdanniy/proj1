import { Injectable } from '@nestjs/common';
import { AddNotificationRequest } from '~common/grpc/interfaces/notifier';

@Injectable()
export class NotificationService {
  async add(request: AddNotificationRequest) {
    console.log(request);

    return { success: true };
  }
}
