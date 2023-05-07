import { Module } from '@nestjs/common';
import { PrimeTrustModule } from '~svc/sdk-gateway/src/payment-gateway/prime_trust/prime-trust.module';

@Module({
  imports: [PrimeTrustModule],
  exports: [PrimeTrustModule],
})
export class PaymentGatewayModule {}
