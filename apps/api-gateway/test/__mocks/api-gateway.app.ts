import { REDIS_CLIENTS } from '@liaoliaots/nestjs-redis/dist/redis/redis.constants';
import { ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import configuration from '~common/config/configuration';
import { ApiExceptionFilter } from '~common/utils/filters/api-exception.filter';
import { AuthModule } from '~svc/api-gateway/src/auth/auth.module';
import { UserModule } from '~svc/api-gateway/src/user/user.module';
import testConfig from './configuration';
import redisClients from './redis';

export default async () => {
  const moduleFixture = await Test.createTestingModule({
    imports: [ConfigModule.forRoot({ load: [configuration, testConfig], isGlobal: true }), AuthModule, UserModule],
  })
    .overrideProvider(REDIS_CLIENTS)
    .useValue(redisClients)
    .compile();

  const app = moduleFixture.createNestApplication();
  const validationOptions: ValidationPipeOptions = {
    whitelist: true,
    transform: true,
    validateCustomDecorators: true,
  };
  app.useGlobalPipes(new ValidationPipe(validationOptions));
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new ApiExceptionFilter(httpAdapter));

  return app;
};
