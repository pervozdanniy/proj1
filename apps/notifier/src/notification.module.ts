import { RedisModule } from '@liaoliaots/nestjs-redis';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration, { ConfigInterface } from '~common/config/configuration';
import { createBullQueue } from '~common/helpers';
import { EmailHandler } from '~svc/notifier/src/queue/email.handler';
import { SmsHandler } from '~svc/notifier/src/queue/sms.handler';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    RedisModule.forRootAsync({
      useFactory(config: ConfigService<ConfigInterface>) {
        const { host, port } = config.get('redis', { infer: true });

        return { config: { host, port } };
      },
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService<ConfigInterface>) => ({
        redis: config.get('redis', { infer: true }),
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueueAsync(
      createBullQueue('sms_queue', 'notifications'),
      createBullQueue('email_queue', 'notifications'),
    ),
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, SmsHandler, EmailHandler],
})
export class NotificationModule {}
