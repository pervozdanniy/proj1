import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { asyncClientOptions } from '~common/grpc/helpers';
import { HttpSessionModule, JwtSessionMiddleware } from '~common/http-session';
import { PaymentGatewayModule } from '../payment-gateway/payment-gateway.module';
import { AuthController } from './controllers/auth.controller';

@Module({
  imports: [
    HttpModule,
    ClientsModule.registerAsync([asyncClientOptions('auth'), asyncClientOptions('core')]),
    HttpSessionModule,
    PaymentGatewayModule,
  ],
  controllers: [AuthController],
  exports: [HttpSessionModule],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtSessionMiddleware).forRoutes(AuthController);
  }
}
