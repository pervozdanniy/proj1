import { ClassSerializerInterceptor, ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiExceptionFilter } from '~common/utils/filters/api-exception.filter';
import { SdkGatewayModule } from './sdk-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(SdkGatewayModule, { rawBody: true });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Skopa SDK')
    .setDescription('Skopa Services microservice API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const validationOptions: ValidationPipeOptions = {
    whitelist: true,
    transform: true,
    validateCustomDecorators: true,
  };
  app.useGlobalPipes(new ValidationPipe(validationOptions));

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new ApiExceptionFilter(httpAdapter));

  app.useGlobalInterceptors(app.get(ClassSerializerInterceptor));

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      docExpansion: 'none',
    },
  });

  await app.listen(3000);
}
bootstrap();
