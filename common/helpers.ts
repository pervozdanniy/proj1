import { BullModuleAsyncOptions } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { ConfigInterface } from '~common/config/configuration';
import { NotificationType } from '~common/grpc/helpers';

export function generatePassword(number, symbol, length) {
  let generatedPassword = '';
  const variationsCount = [number, symbol].length;

  for (let i = 0; i < length; i += variationsCount) {
    if (number) {
      generatedPassword += getRandomNumber();
    }
    if (symbol) {
      generatedPassword += getRandomSymbol();
    }
    generatedPassword += getRandomString();
  }

  const finalPassword = generatedPassword.slice(0, length);

  return finalPassword;
}

function getRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < 7; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

function getRandomNumber() {
  return String.fromCharCode(Math.floor(Math.random() * 10) + 48);
}

function getRandomSymbol() {
  const symbols = '!@#$%^&*(){}[]<>';

  return symbols[Math.floor(Math.random() * symbols.length)];
}

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
