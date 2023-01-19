import { Injectable } from '@nestjs/common';
import { SendType } from '~common/constants/user';
import { AddNotificationRequest } from '~common/grpc/interfaces/notifier';

@Injectable()
export class NotificationService {
  async add(request: AddNotificationRequest) {
    const {
      user_data: { send_type },
    } = request;

    if (send_type === SendType.SMS) {
      //send sms
    } else if (send_type === SendType.EMAIL) {
      //send email
    }

    return { success: true };
  }
}
