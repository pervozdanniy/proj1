import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '~common/config/configuration';
import { AuthModule } from './auth';
import { CountryModule } from './country/country.module';
import { HealthModule } from './health/health.module';
import { NotificationModule } from './notification/notification.module';
import { PaymentGatewayModule } from './payment-gateway/payment-gateway.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    UserModule,
    PaymentGatewayModule,
    AuthModule,
    CountryModule,
    NotificationModule,
    HealthModule,
  ],
})
export class ApiGatewayModule {}
