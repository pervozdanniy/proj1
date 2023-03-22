import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { asyncClientOptions } from '~common/grpc/helpers';
import { HttpSessionModule, JwtSessionMiddleware } from '~common/http-session';
import { TwoFactorController } from './controllers/2fa.controller';
import { AuthController } from './controllers/auth.controller';
import { ChangePasswordController } from './controllers/change-password.controller';
import { RegistrationController } from './controllers/registration.controller';
import { ResetPasswordController } from './controllers/reset-password.controller';
import { TwoFactorService } from './services/2fa.service';
import { AuthService } from './services/auth.service';
import { RegistrationService } from './services/registration.service';
import { ResetPasswordService } from './services/reset-password.service';

@Module({
  imports: [ClientsModule.registerAsync([asyncClientOptions('auth'), asyncClientOptions('core')]), HttpSessionModule],
  controllers: [
    AuthController,
    TwoFactorController,
    RegistrationController,
    ResetPasswordController,
    ChangePasswordController,
  ],
  providers: [AuthService, TwoFactorService, RegistrationService, ResetPasswordService],
  exports: [TwoFactorService, HttpSessionModule],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtSessionMiddleware)
      .forRoutes(
        AuthController,
        TwoFactorController,
        RegistrationController,
        ResetPasswordController,
        ChangePasswordController,
      );
  }
}
