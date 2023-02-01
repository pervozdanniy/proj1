import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sendGrid from '@sendgrid/mail';
import { Job } from 'bull';
import { ConfigInterface } from '~common/config/configuration';
import { AddNotificationRequest } from '~common/grpc/interfaces/notifier';

@Injectable()
@Processor('email_queue')
export class EmailHandler {
  private readonly logger = new Logger(EmailHandler.name);

  private readonly from_email: string;

  constructor(private config: ConfigService<ConfigInterface>) {
    const { key, email } = config.get('sendgrid');
    this.from_email = email;
    sendGrid.setApiKey(key);
  }
  @Process('send')
  async handleSms(job: Job<AddNotificationRequest>) {
    const {
      notification: { title, body },
      options: { email },
    } = job.data;
    await sendGrid.send({
      to: email,
      subject: 'Skopa notification',
      from: this.from_email,
      text: title,
      html: `<h3>${body}</h3>`,
    });
  }

  @OnQueueFailed({ name: 'send' })
  async test(job: Job, err: Error) {
    if (job.opts.attempts === job.attemptsMade) {
      //do something
    }
    if (err) {
      this.logger.error(err);
    }
  }
}
