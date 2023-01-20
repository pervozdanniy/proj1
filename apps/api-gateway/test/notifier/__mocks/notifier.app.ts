import { REDIS_CLIENTS } from '@liaoliaots/nestjs-redis/dist/redis/redis.constants';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import configuration, { ConfigInterface } from '~common/config/configuration';
import { createBullQueue } from '~common/grpc/helpers';
import testConfig from '~svc/api-gateway/test/auth/__mocks/configuration';
import redisClients from '~svc/api-gateway/test/__mocks/redis';
import { NotificationController } from '~svc/notifier/src/notification.controller';
import { NotificationService } from '~svc/notifier/src/notification.service';

export default async () => {
  const notifier = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ load: [configuration, testConfig], isGlobal: true }),
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
    ],
    controllers: [NotificationController],
    providers: [
      {
        provide: NotificationService,
        useFactory: jest.fn(() => ({
          add: jest.fn().mockResolvedValue(true),
        })),
      },
    ],
  })
    .overrideProvider(REDIS_CLIENTS)
    .useValue(redisClients)
    .compile();

  return notifier;
};
