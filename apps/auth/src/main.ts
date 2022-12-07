import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';
import { join } from 'path';
import { ConfigInterface } from '~common/config/configuration';
import sentryInit from '~common/sentry/init';
import { AuthModule } from './auth.module';

async function bootstrap() {
  const context = await NestFactory.createApplicationContext(AuthModule);
  const config = context.get(ConfigService<ConfigInterface>);

  sentryInit();

  const app = await NestFactory.createMicroservice<GrpcOptions>(AuthModule, {
    transport: Transport.GRPC,
    options: {
      url: `0.0.0.0:${config.get('grpcServices.auth.port', { infer: true })}`,
      package: 'auth',
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
      protoPath: join(config.get('basePath'), 'common/_proto/auth.proto'),
    },
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));

  await app.listen();
}
bootstrap();
