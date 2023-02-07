import { Module } from '@nestjs/common';
import { PrimeTrustModule } from '~svc/api-gateway/src/api/payment-gateway/prime_trust/prime-trust.module';

@Module({
  imports: [PrimeTrustModule],
})
export class PaymentGatewayModule {}
