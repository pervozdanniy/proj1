import { ClassSerializerInterceptor, ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import sentryInit from 'common/sentry/init';
import { join } from 'path';
import { ConfigInterface } from '~common/config/configuration';
import { ApiExceptionFilter } from '~common/utils/filters/api-exception.filter';
import { ApiGatewayModule } from './api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(ApiGatewayModule, { rawBody: true });
  const configPath = app.get(ConfigService<ConfigInterface>);
  sentryInit();

  const config = new DocumentBuilder()
    .setTitle('Skopa Services API')
    .setDescription('Skopa Services microservice API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  app.useStaticAssets(join(configPath.get('basePath'), 'common/public'));
  app.setBaseViewsDir(join(configPath.get('basePath'), 'common/views'));
  app.setViewEngine('hbs');

  const validationOptions: ValidationPipeOptions = {
    whitelist: true,
    transform: true,
    validateCustomDecorators: true,
  };
  app.useGlobalPipes(new ValidationPipe(validationOptions));

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new ApiExceptionFilter(httpAdapter));

  app.useGlobalInterceptors(app.get(ClassSerializerInterceptor));

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      docExpansion: 'none',
    },
  });

  await app.listen(3000);
}

bootstrap();
