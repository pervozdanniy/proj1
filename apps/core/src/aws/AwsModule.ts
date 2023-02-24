import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigInterface } from '~common/config/configuration';
import { AwsKmsService } from './services/aws.kms.service';
import { AwsSqsProducerService } from './services/aws.sqs.producer.service';

@Module({
  providers: [
    {
      inject: [ConfigService],
      useFactory: (config: ConfigService<ConfigInterface>) => {
        return new AwsKmsService(config.get('aws', { infer: true }));
      },
      provide: AwsKmsService,
    },
    {
      inject: [ConfigService],
      useFactory: (config: ConfigService<ConfigInterface>) => {
        return new AwsSqsProducerService(config.get('aws.credentials', { infer: true }));
      },
      provide: AwsSqsProducerService,
    },
  ],
  exports: [AwsKmsService, AwsSqsProducerService],
})
export class AwsModule {}
