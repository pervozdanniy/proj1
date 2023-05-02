import { DEFAULT_REDIS_NAMESPACE } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

export const redisStorage = new Map<string, any>();

export const redisProvider = {
  connect: jest.fn().mockResolvedValue(true),
  get: jest.fn().mockImplementation(async (key: string) => redisStorage.get(key)),
  set: jest.fn().mockImplementation(async (key: string, value: any) => redisStorage.set(key, value)),
  disconnect: jest.fn().mockResolvedValue(true),
};

const providers = new Map<string, Partial<Redis>>();
providers.set(DEFAULT_REDIS_NAMESPACE, redisProvider);

export default providers;
