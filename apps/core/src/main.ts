import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ConfigInterface } from '~common/config/configuration';
import sentryInit from '~common/sentry/init';
import { CoreModule } from './core.module';

async function bootstrap() {
  const context = await NestFactory.createApplicationContext(CoreModule);
  const config = context.get(ConfigService<ConfigInterface>);

  sentryInit();

  const app = await NestFactory.createMicroservice<GrpcOptions>(CoreModule, {
    transport: Transport.GRPC,
    options: {
      url: '0.0.0.0:5000',
      package: 'skopa.core',
      loader: {
        keepCase: true,
        longs: String,
        defaults: true,
        oneofs: true,
      },
      protoPath: join(config.get('basePath'), 'common/grpc/_proto/core.proto'),
    },
    bufferLogs: true,
  });

  return app.listen();
}

bootstrap();
