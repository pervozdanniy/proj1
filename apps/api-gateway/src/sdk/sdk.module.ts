import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '~common/config/configuration';
import { ClientModule } from '~svc/api-gateway/src/sdk/client/client.module';
import { SdkPaymentGatewayModule } from '~svc/api-gateway/src/sdk/payment-gateway/sdk-payment-gateway.module';

@Module({
  imports: [ConfigModule.forRoot({ load: [configuration], isGlobal: true }), ClientModule, SdkPaymentGatewayModule],
})
export class SdkModule {}
