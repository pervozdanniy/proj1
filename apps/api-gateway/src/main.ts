import { ClassSerializerInterceptor, RawBodyRequest, ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import sentryInit from 'common/sentry/init';
import { ApiExceptionFilter } from '~common/utils/filters/api-exception.filter';
import { ApiGatewayModule } from './api-gateway.module';
import { raw, Request } from 'express';
import { Buffer } from 'node:buffer';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule, { bodyParser: true });

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
    transform: true,
    validateCustomDecorators: true,
  };
  app.useGlobalPipes(new ValidationPipe(validationOptions));
  app.useGlobalFilters(new ApiExceptionFilter());
  app.useGlobalInterceptors(app.get(ClassSerializerInterceptor));
  // app.useLogger(app.get(Logger));
  // app.useGlobalInterceptors(new LoggerErrorInterceptor(), app.get(ClassSerializerInterceptor));

  const rawBodyBuffer = (req: RawBodyRequest<Request>, res, buffer: Buffer) => {
    if (Buffer.isBuffer(buffer)) {
      req.rawBody = buffer;
    }

    return true;
  };

  app.use(
    raw({
      type: 'application/vnd.skopa.encrypted',
      verify: rawBodyBuffer,
    }),
  );

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      docExpansion: 'none',
    },
  });

  await app.listen(3000);
}

bootstrap();
