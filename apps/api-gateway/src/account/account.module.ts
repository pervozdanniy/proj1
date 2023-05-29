import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JwtSessionMiddleware } from '~common/http-session';
import { AuthModule } from '../auth';
import { PaymentGatewayModule } from '../payment-gateway/payment-gateway.module';
import { UserModule } from '../user/user.module';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
  imports: [AuthModule, UserModule, PaymentGatewayModule],
  providers: [AccountService],
  controllers: [AccountController],
})
export class AccountModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtSessionMiddleware).forRoutes(AccountController);
  }
}
