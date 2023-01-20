import { Status } from '@grpc/grpc-js/build/src/constants';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { SendType } from '~common/constants/user';
import { AddNotificationRequest } from '~common/grpc/interfaces/notifier';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';

@Injectable()
export class NotificationService {
  constructor(
    @InjectQueue('sms_queue') private smsQueue: Queue,
    @InjectQueue('email_queue') private emailQueue: Queue,
  ) {}
  async add(request: AddNotificationRequest) {
    const {
      user_data: { send_type },
    } = request;

    if (send_type & SendType.SMS) {
      await this.smsQueue.add('send', { data: request });
    }
    if (send_type & SendType.EMAIL) {
      await this.emailQueue.add('send_email', { data: request });
    }

    return { success: true };
  }
}
