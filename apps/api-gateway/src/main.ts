import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import { ApiExceptionFilter } from '~command/filters/api-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  const config = new DocumentBuilder()
    .setTitle('Gratitude Services API')
    .setDescription('Gratitude Services microservice API')
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
