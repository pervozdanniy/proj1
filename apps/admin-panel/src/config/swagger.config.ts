import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AUTH_OPTIONS, REFRESH_TOKEN_NAME, TOKEN_NAME } from '../modules/auth/constants';

const title = 'Skopa Admin Panel API';
const description = 'Skopa Admin Panel API';

/**
 * Setup swagger in the application
 * @param app {INestApplication}
 */
export const SwaggerConfig = (app: INestApplication, apiVersion: string) => {
  const options = new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .setVersion(apiVersion)
    .addBearerAuth(AUTH_OPTIONS, TOKEN_NAME)
    .addCookieAuth(REFRESH_TOKEN_NAME)
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup(`api/v${apiVersion}/swagger`, app, document);
};
