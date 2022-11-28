import { NestFactory } from '@nestjs/core';
import { BcListenerModule } from './bc-listener.module';

async function bootstrap() {
  const app = await NestFactory.create(BcListenerModule);
  await app.listen(3000);
}
bootstrap();
