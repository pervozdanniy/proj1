import { Module } from '@nestjs/common';
import { AwsSdkModule } from 'nest-aws-sdk';
import { KMS, SharedIniFileCredentials, SQS } from 'aws-sdk';
import { AwsKmsService } from '~svc/core/src/aws/services/aws.kms.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration, { ConfigInterface } from '~common/config/configuration';
import { AwsSqsProducerService } from '~svc/core/src/aws/services/aws.sqs.producer.service';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    AwsSdkModule.forRoot({
      defaultServiceOptions: {
        region: 'us-east-1',
        credentials: new SharedIniFileCredentials({
          profile: 'skopa-kms',
        }),
      },
      services: [KMS, SQS],
    }),
  ],
  controllers: [],
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
        return new AwsSqsProducerService(config.get('aws', { infer: true }));
      },
      provide: AwsSqsProducerService,
    },
  ],
  exports: [AwsKmsService, AwsSqsProducerService],
})
export class AwsModule {}
