import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { asyncClientOptions } from '~common/grpc/helpers';
import { HttpSessionModule, JwtSessionMiddleware } from '~common/http-session';
import { TwoFactorController } from './controllers/2fa.controller';
import { AuthController } from './controllers/auth.controller';
import { RegistrationController } from './controllers/registration.controller';
import { TwoFactorService } from './services/2fa.service';
import { AuthService } from './services/auth.service';
import { RegistrationService } from './services/registration.service';

@Module({
  imports: [ClientsModule.registerAsync([asyncClientOptions('auth'), asyncClientOptions('core')]), HttpSessionModule],
  controllers: [AuthController, TwoFactorController, RegistrationController],
  providers: [AuthService, TwoFactorService, RegistrationService],
  exports: [TwoFactorService, HttpSessionModule],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtSessionMiddleware).forRoutes(AuthController, TwoFactorController, RegistrationController);
  }
}
