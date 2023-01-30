import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '~common/config/configuration';
import { AuthModule } from '~svc/api-gateway/src/api/auth/auth.module';
import { CountryModule } from '~svc/api-gateway/src/api/country/country.module';
import { NotificationModule } from '~svc/api-gateway/src/api/notification/notification.module';
import { PaymentGatewayModule } from '~svc/api-gateway/src/api/payment-gateway/payment-gateway.module';
import { UserModule } from '~svc/api-gateway/src/api/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    UserModule,
    PaymentGatewayModule,
    AuthModule,
    CountryModule,
    NotificationModule,
  ],
})
export class ApiModule {}
