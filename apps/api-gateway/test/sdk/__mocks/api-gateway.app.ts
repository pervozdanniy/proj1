import { ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { ClientsModule } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import configuration from '~common/config/configuration';
import { asyncClientOptions } from '~common/grpc/helpers';
import { ApiExceptionFilter } from '~common/utils/filters/api-exception.filter';
import { ClientController } from '../../../src/api/client/client.controller';
import { ClientService } from '../../../src/api/client/client.service';
import testConfig from './configuration';

export default async () => {
  const moduleFixture = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ load: [configuration, testConfig], isGlobal: true }),
      ClientsModule.registerAsync([asyncClientOptions('core'), asyncClientOptions('auth')]),
    ],
    controllers: [ClientController],
    providers: [ClientService],
  }).compile();

  const app = moduleFixture.createNestApplication({ rawBody: true });
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
