import { CreateQueueCommand, GetQueueUrlCommand, SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
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

  async createQueue(name: string): Promise<any> {
    const params = { QueueName: name };
    const command = new CreateQueueCommand(params);
    const response = await this.sqsClient.send(command);
    return response;
  }

  async sendMessage(QueueUrl: string, MessageBody): Promise<any> {
    const command = new SendMessageCommand({
      MessageBody,
      QueueUrl,
    });
    const response = await this.sqsClient.send(command);
    return response;
  }

  async getQueueUrl(QueueName: string): Promise<any> {
    const command = new GetQueueUrlCommand({ QueueName });
    const response = await this.sqsClient.send(command);
    return response;
  }
}
