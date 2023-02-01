import { BullModuleAsyncOptions } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { ConfigInterface } from '~common/config/configuration';
import { NotificationType } from '~common/grpc/helpers';

export const createBullQueue = (name: string, type: NotificationType): BullModuleAsyncOptions => ({
  name,
  useFactory(config: ConfigService<ConfigInterface>) {
    const { attempts, delay } = config.get(`queues.${type}`, { infer: true });

    return {
      defaultJobOptions: {
        attempts,
        backoff: {
          type: 'fixed',
          delay,
        },
      },
    };
  },
  inject: [ConfigService],
});
