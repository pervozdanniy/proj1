import { Injectable } from '@nestjs/common';
import { AddNotificationRequest } from '~common/grpc/interfaces/notifier';

@Injectable()
export class NotificationService {
  async add(request: AddNotificationRequest) {
    const {
      user_data: { send_type },
    } = request;
    switch (send_type) {
      case 'all':
        //some operation
        break;
      case 'email':
        //some operation
        break;
      case 'sms':
        //some operation
        break;
    }

    return { success: true };
  }
}
