import { AuthModule } from '@/api/auth/auth.module';
import { CountryModule } from '@/api/country/country.module';
import { NotificationModule } from '@/api/notification/notification.module';
import { PaymentGatewayModule } from '@/api/payment-gateway/payment-gateway.module';
import { UserModule } from '@/api/user/user.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '~common/config/configuration';

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
