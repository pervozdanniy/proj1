import { ClassSerializerInterceptor, ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import sentryInit from 'common/sentry/init';
import { JwtSessionMiddleware } from '~common/session';
import { ApiExceptionFilter } from '~common/utils/filters/api-exception.filter';
import { ApiGatewayModule } from './api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule, { rawBody: true });

  sentryInit();

  const config = new DocumentBuilder()
    .setTitle('Skopa Services API')
    .setDescription('Skopa Services microservice API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const validationOptions: ValidationPipeOptions = {
    whitelist: true,
    transform: true,
    validateCustomDecorators: true,
  };
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalPipes(new ValidationPipe(validationOptions));
  app.useGlobalFilters(new ApiExceptionFilter(httpAdapter));
  app.useGlobalInterceptors(app.get(ClassSerializerInterceptor));
  app.use((req, res, next) => app.get(JwtSessionMiddleware).use(req, res, next));

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      docExpansion: 'none',
    },
  });

  await app.listen(3000);
}

bootstrap();
