import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { AddNotificationRequest } from '~common/grpc/interfaces/notifier';
import { SlickTextService } from '../slicktext/slicktext.service';

@Injectable()
@Processor('sms_queue')
export class SmsHandler {
  private readonly logger = new Logger(SmsHandler.name);

  constructor(private readonly slickText: SlickTextService) {}

  @Process('send')
  async handleSms({ data }: Job<AddNotificationRequest>) {
    await this.slickText.send(data.options.phone, data.notification.body);
  }

  @OnQueueFailed({ name: 'send' })
  catch(job: Job<AddNotificationRequest>, error: Error) {
    this.logger.error('Sending SMS: failed', error.stack, { error, options: job.data.options });
  }
}
