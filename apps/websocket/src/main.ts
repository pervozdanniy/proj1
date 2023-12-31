import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ConfigInterface } from '~common/config/configuration';
import { GrpcSessionMiddleware } from '~common/grpc-session';
import { GrpcOptions } from '~common/grpc-session/utils/interceptors';
import sentryInit from '~common/sentry/init';
import { WebsocketModule } from './websocket.module';

async function bootstrap() {
  const app = await NestFactory.create(WebsocketModule);
  const config = app.get(ConfigService<ConfigInterface>);

  sentryInit();

  app.connectMicroservice<GrpcOptions>({
    transport: Transport.GRPC,
    options: {
      interceptors: [app.get(GrpcSessionMiddleware)],
      url: '0.0.0.0:5000',
      package: 'skopa.websocket',
      loader: {
        keepCase: true,
        longs: String,
        defaults: true,
        oneofs: true,
      },
      protoPath: join(config.get('basePath'), 'common/grpc/_proto/websocket.proto'),
    },
  });
  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
