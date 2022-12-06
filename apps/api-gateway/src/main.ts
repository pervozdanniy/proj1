import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, ValidationPipeOptions } from '@nestjs/common';

import { ApiExceptionFilter } from 'common/filters/api-exception.filter';
import sentryInit from 'common/sentry/init';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  sentryInit();

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
  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      docExpansion: 'none',
    },
  });

  await app.listen(3000);
}

bootstrap();
