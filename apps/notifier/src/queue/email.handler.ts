import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';

@Injectable()
@Processor('email_queue')
export class EmailHandler {
  private readonly logger = new Logger(EmailHandler.name);

  constructor() {}
  @Process('send')
  async handleSms(job: Job) {
    console.log('work');
    this.logger.log(job.data);
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
