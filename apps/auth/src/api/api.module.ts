import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { GrpcSessionModule } from '~common/grpc-session';
import { asyncClientOptions } from '~common/grpc/helpers';
import { Auth2FAModule } from '../auth-2fa/2fa.module';
import { AuthModule } from '../auth/auth.module';
import { TwoFactorController } from './controllers/2fa.controller';
import { AuthApiController } from './controllers/api.controller';
import { ApiContactInfoController } from './controllers/contact-info.controller';
import { ApiRegisterController } from './controllers/register.controller';
import { ApiResetPasswordController } from './controllers/reset-password.controller';
import { AuthApiService } from './services/api.service';
import { ApiSocialsService } from './services/api.socials.service';
import { ApiContactInfoService } from './services/contact-info.service';
import { ApiRegisterService } from './services/register.service';
import { ApiResetPasswordService } from './services/reset-password.service';

@Module({
  imports: [ClientsModule.registerAsync([asyncClientOptions('core')]), GrpcSessionModule, AuthModule, Auth2FAModule],
  controllers: [
    AuthApiController,
    TwoFactorController,
    ApiContactInfoController,
    ApiRegisterController,
    ApiResetPasswordController,
  ],
  providers: [AuthApiService, ApiSocialsService, ApiRegisterService, ApiResetPasswordService, ApiContactInfoService],
})
export class AuthApiModule {}
