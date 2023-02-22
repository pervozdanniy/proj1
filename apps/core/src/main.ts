import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ConfigInterface } from '~common/config/configuration';
import sentryInit from '~common/sentry/init';
import { CoreModule } from './core.module';

async function bootstrap() {
  const context = await NestFactory.create(CoreModule);
  const config = context.get(ConfigService<ConfigInterface>);

  sentryInit();

  const app = context.connectMicroservice<GrpcOptions>({
    transport: Transport.GRPC,
    options: {
      url: '0.0.0.0:5000',
      package: ['skopa.core', 'grpc.health.v1'],
      loader: {
        keepCase: true,
        longs: String,
        defaults: true,
        oneofs: true,
      },
      protoPath: [
        join(config.get('basePath'), 'common/grpc/_proto/core.proto'),
        join(config.get('basePath'), 'common/grpc/_proto/health.proto'),
      ],
    },
  });

  await context.init();

  return app.listen();
}

bootstrap();
