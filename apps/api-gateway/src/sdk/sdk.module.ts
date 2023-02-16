import { ClientModule } from '@/sdk/client/client.module';
import { SdkPaymentGatewayModule } from '@/sdk/payment-gateway/sdk-payment-gateway.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '~common/config/configuration';

@Module({
  imports: [ConfigModule.forRoot({ load: [configuration], isGlobal: true }), ClientModule, SdkPaymentGatewayModule],
})
export class SdkModule {}
