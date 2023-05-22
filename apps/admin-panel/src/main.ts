import { HttpExceptionFilter, HttpResponseInterceptor } from '@adminCommon/http';
import { SwaggerConfig } from '@config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AdminPanelModule } from './admin-panel.module';

const bootstrap = async () => {
  const app = await NestFactory.create(AdminPanelModule);

  app.enableCors();
  app.enableVersioning();

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new HttpResponseInterceptor());
  app.useGlobalPipes(new ValidationPipe());

  app.setGlobalPrefix(AdminPanelModule.apiPrefix);
  SwaggerConfig(app, AdminPanelModule.apiVersion);
  await app.listen(AdminPanelModule.port);

  return AdminPanelModule.port;
};

bootstrap().then((port: number) => {
  Logger.log(`Application running on port: ${port}`, 'Main');
});
