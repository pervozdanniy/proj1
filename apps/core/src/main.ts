import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { CoreModule } from './core.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(CoreModule, {
    transport: Transport.GRPC,
    options: {
      url: '0.0.0.0:50000',
      package: 'core_service',
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
      protoPath: join(process.env.BASE_PATH, 'common/_proto', 'core.proto'),
    },
  });

  return app.listen();
}

bootstrap();
