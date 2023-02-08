import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { AddNotificationRequest, NotifyRequest } from '~common/grpc/interfaces/notifier';
import { SlickTextService } from '../slicktext/slicktext.service';

@Injectable()
@Processor('sms_queue')
export class SmsHandler {
  private readonly logger = new Logger(SmsHandler.name);

  constructor(private readonly slickText: SlickTextService) {}

  @Process('send')
  async handleSms({ data }: Job<AddNotificationRequest>) {
    await this.slickText.send(data.options.phone, this.composeMessage(data.notification));
  }

  private composeMessage(message: NotifyRequest) {
    if (message.title) {
      return `${message.title}:\n${message.body}`;
    }

    return message.body;
  }

  @OnQueueFailed({ name: 'send' })
  catch(job: Job<AddNotificationRequest>, error: Error) {
    this.logger.error('Sending SMS: failed', error.stack, { options: job.data.options });
  }
}
