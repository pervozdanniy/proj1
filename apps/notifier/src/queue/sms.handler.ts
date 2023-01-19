import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';

@Injectable()
@Processor('sms_queue')
export class SmsHandler {
  private readonly logger = new Logger(SmsHandler.name);
  @Process('send')
  async handleSms(job: Job) {
    //send sms
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
