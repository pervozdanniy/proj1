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

  createQueue(name: string): Promise<CreateQueueCommandOutput> {
    const params = { QueueName: name };
    const command = new CreateQueueCommand(params);

    return this.sqsClient.send(command);
  }

  sendMessage(QueueUrl: string, MessageBody): Promise<SendMessageCommandOutput> {
    const command = new SendMessageCommand({
      MessageBody,
      QueueUrl,
    });

    return this.sqsClient.send(command);
  }

  getQueueUrl(QueueName: string): Promise<GetQueueUrlResult> {
    const command = new GetQueueUrlCommand({ QueueName });

    return this.sqsClient.send(command);
  }
}
