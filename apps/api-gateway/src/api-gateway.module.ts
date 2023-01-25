import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '~common/config/configuration';
import { CountryModule } from '~svc/api-gateway/src/country/country.module';
import { NotificationModule } from '~svc/api-gateway/src/notification/notification.module';
import { AuthModule } from './auth/auth.module';
import { ClientModule } from './client/client.module';
import { PaymentGatewayModule } from './payment-gateway/payment-gateway.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    UserModule,
    PaymentGatewayModule,
    AuthModule,
    ClientModule,
    CountryModule,
    NotificationModule,
  ],
})
export class ApiGatewayModule {}
