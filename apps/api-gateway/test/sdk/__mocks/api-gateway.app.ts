import { ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import configuration from '~common/config/configuration';
import { asyncClientOptions } from '~common/grpc/helpers';
import { ApiExceptionFilter } from '~common/utils/filters/api-exception.filter';
import { ClientController } from '../../../src/client/client.controller';
import { ClientService } from '../../../src/client/client.service';
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
  app.useGlobalFilters(new ApiExceptionFilter());
  const validationOptions: ValidationPipeOptions = {
    whitelist: true,
    transform: true,
    validateCustomDecorators: true,
  };
  app.useGlobalPipes(new ValidationPipe(validationOptions));

  return app;
};
