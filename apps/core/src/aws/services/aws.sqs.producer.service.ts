import {
  CreateQueueCommand,
  CreateQueueCommandOutput,
  GetQueueUrlCommand,
  GetQueueUrlResult,
  SendMessageCommand,
  SendMessageCommandOutput,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { Injectable } from '@nestjs/common';
import { ConfigInterface } from '~common/config/configuration';

@Injectable()
export class AwsSqsProducerService {
  private sqsClient: SQSClient;

  constructor(aws: ConfigInterface['aws']) {
    this.sqsClient = new SQSClient({
      region: aws.region,
      credentials: {
        accessKeyId: aws.accessKeyId,
        secretAccessKey: aws.secretAccessKey,
      },
    });
  }

  async createQueue(name: string): Promise<CreateQueueCommandOutput> {
    const params = { QueueName: name };
    const command = new CreateQueueCommand(params);

    return await this.sqsClient.send(command);
  }

  async sendMessage(QueueUrl: string, MessageBody): Promise<SendMessageCommandOutput> {
    const command = new SendMessageCommand({
      MessageBody,
      QueueUrl,
    });

    return await this.sqsClient.send(command);
  }

  async getQueueUrl(QueueName: string): Promise<GetQueueUrlResult> {
    const command = new GetQueueUrlCommand({ QueueName });

    return await this.sqsClient.send(command);
  }
}
