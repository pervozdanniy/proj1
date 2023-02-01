import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { AddNotificationRequest, SendType } from '~common/grpc/interfaces/notifier';

@Injectable()
export class NotificationService {
  constructor(
    @InjectQueue('sms_queue') private smsQueue: Queue,
    @InjectQueue('email_queue') private emailQueue: Queue,
  ) {}
  async add(request: AddNotificationRequest) {
    const {
      options: { send_type },
    } = request;

    if (send_type & SendType.SEND_TYPE_SMS) {
      await this.smsQueue.add('send', request);
    }
    if (send_type & SendType.SEND_TYPE_EMAIL) {
      await this.emailQueue.add('send', request);
    }

    return { success: true };
  }
}
