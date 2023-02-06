import { Module } from '@nestjs/common';
import { SdkPrimeTrustModule } from '~svc/api-gateway/src/sdk/payment-gateway/prime_trust/sdk-prime-trust.module';

@Module({
  imports: [SdkPrimeTrustModule],
})
export class SdkPaymentGatewayModule {}
