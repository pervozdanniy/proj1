import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ConfigInterface } from '~common/config/configuration';
import sentryInit from '~common/sentry/init';
import { WebsocketModule } from './websocket.module';

async function bootstrap() {
  const app = await NestFactory.create(WebsocketModule);
  const config = app.get(ConfigService<ConfigInterface>);

  sentryInit();

  app.connectMicroservice<GrpcOptions>({
    transport: Transport.GRPC,
    options: {
      // url: `0.0.0.0:${config.get('grpcServices.auth.port', { infer: true })}`,
      url: '0.0.0.0:5000',
      package: 'skopa.auth',
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
      protoPath: join(config.get('basePath'), 'common/grpc/_proto/auth.proto'),
    },
  });
  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
