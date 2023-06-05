import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import * as process from 'process';
import { AdminPanelModule } from './admin-panel.module';
import { HttpExceptionFilter, HttpResponseInterceptor } from './common/http';
import { SwaggerConfig } from './config/swagger.config';

const bootstrap = async () => {
  const app = await NestFactory.create(AdminPanelModule);

  app.enableVersioning();
  app.use(cookieParser());

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new HttpResponseInterceptor());
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({ credentials: true, origin: process.env.ADMIN_PANEL_CORS_ORIGINS });

  app.setGlobalPrefix(AdminPanelModule.apiPrefix);
  SwaggerConfig(app, AdminPanelModule.apiVersion);
  await app.listen(AdminPanelModule.port);

  return AdminPanelModule.port;
};

bootstrap().then((port: number) => {
  Logger.log(`Application running on port: ${port}`, 'Main');
});
