import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ConfigInterface } from '~common/config/configuration';
import sentryInit from '~common/sentry/init';
import { AppModule } from './app.module';

async function bootstrap() {
  const context = await NestFactory.createApplicationContext(AppModule);
  const config = context.get(ConfigService<ConfigInterface>);

  sentryInit();

  const app = await NestFactory.createMicroservice<GrpcOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      // url: `0.0.0.0:${config.get('grpcServices.auth.port', { infer: true })}`,
      url: '0.0.0.0:5000',
      package: 'skopa.auth',
      loader: {
        keepCase: true,
        longs: String,
        defaults: true,
        oneofs: true,
      },
      protoPath: join(config.get('basePath'), 'common/grpc/_proto/auth.proto'),
    },
    bufferLogs: true,
  });
  // app.useLogger(app.get(Logger));

  await app.listen();
}
bootstrap();
