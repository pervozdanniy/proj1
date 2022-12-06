import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { ApiExceptionFilter } from 'common/filters/api-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  Sentry.init({
    dsn: 'https://a5fe41c445014314a19abbb4d46ffaa9@o4504280496996352.ingest.sentry.io/4504280501256192',
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
    ],
    tracesSampleRate: 1.0,
  });

  const transaction = Sentry.startTransaction({
    op: 'transaction',
    name: 'My Transaction',
  });

  Sentry.configureScope((scope) => {
    scope.setSpan(transaction);
  });

  const config = new DocumentBuilder()
    .setTitle('Skopa Services API')
    .setDescription('Skopa Services microservice API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const validationOptions: ValidationPipeOptions = {
    forbidNonWhitelisted: true,
    whitelist: true,
  };
  app.useGlobalPipes(new ValidationPipe(validationOptions));
  app.useGlobalFilters(new ApiExceptionFilter());

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      docExpansion: 'none',
    },
  });

  await app.listen(3000);
}

bootstrap();
