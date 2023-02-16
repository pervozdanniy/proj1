import { SdkPrimeTrustModule } from '@/sdk/payment-gateway/prime_trust/sdk-prime-trust.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [SdkPrimeTrustModule],
})
export class SdkPaymentGatewayModule {}
