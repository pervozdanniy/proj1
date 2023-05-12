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

export const createDate = () => {
  const date = new Date();
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const formattedDate = `${day}-${month}-${year}`;

  return formattedDate;
};

export const generateRandomString = () => {
  const timestamp = Date.now().toString();
  let randomString = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }

  return `${timestamp}_${randomString}`;
};
