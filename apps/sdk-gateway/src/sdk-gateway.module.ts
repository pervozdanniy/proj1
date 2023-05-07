import { ClientModule } from '@/client/client.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '~common/config/configuration';
import { PaymentGatewayModule } from '~svc/sdk-gateway/src/payment-gateway/payment-gateway.module';
import { AuthModule } from './auth';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    AuthModule,
    ClientModule,
    PaymentGatewayModule,
  ],
})
export class SdkGatewayModule {}
