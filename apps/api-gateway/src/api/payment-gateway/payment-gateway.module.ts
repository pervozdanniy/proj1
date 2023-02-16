import { PrimeTrustModule } from '@/api/payment-gateway/prime_trust/prime-trust.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrimeTrustModule],
})
export class PaymentGatewayModule {}
