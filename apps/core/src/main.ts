import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { CoreModule } from './core.module';
import { ConfigService } from '@nestjs/config';
import { ConfigInterface } from '~common/config/configuration';
import { Logger } from 'nestjs-pino';
import sentryInit from '~common/sentry/init';

async function bootstrap() {
  const context = await NestFactory.createApplicationContext(CoreModule);
  const config = context.get(ConfigService<ConfigInterface>);

  sentryInit();

  const app = await NestFactory.createMicroservice<GrpcOptions>(CoreModule, {
    transport: Transport.GRPC,
    options: {
      url: `0.0.0.0:${config.get('grpcServices.core.port', { infer: true })}`,
      package: 'core',
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
      protoPath: join(config.get('basePath'), 'common/_proto/core.proto'),
    },
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));

  return app.listen();
}

bootstrap();
