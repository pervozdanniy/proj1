import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import process from 'process';
import { ConfigInterface } from '~common/config/configuration';
import migrations from '~svc/core/src/db/migrations-list';
import { PrimeTrustAccountEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-account.entity';
import { PrimeTrustContactEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-contact.entity';
import { PrimeTrustKycDocumentEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-kyc-document.entity';
import { PrimeTrustUserEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-user.entity';
import { PaymentGatewayManager } from '~svc/core/src/payment-gateway/manager/payment-gateway.manager';
import { PaymentGatewayQueueHandler } from '~svc/core/src/payment-gateway/queues/payment-gateway-queue.handler';
import { PaymentGatewayService } from '~svc/core/src/payment-gateway/services/payment.gateway.service';
import { PrimeAccountManager } from '~svc/core/src/payment-gateway/services/prime_trust/managers/prime-account.manager';
import { PrimeKycManager } from '~svc/core/src/payment-gateway/services/prime_trust/managers/prime-kyc-manager';
import { PrimeTokenManager } from '~svc/core/src/payment-gateway/services/prime_trust/managers/prime-token.manager';
import { PrimeUserManager } from '~svc/core/src/payment-gateway/services/prime_trust/managers/prime-user-manager';
import { PrimeWireManager } from '~svc/core/src/payment-gateway/services/prime_trust/managers/prime-wire.manager';
import { PrimeTrustService } from '~svc/core/src/payment-gateway/services/prime_trust/prime-trust.service';
import { UserModule } from '~svc/core/src/user/user.module';
import { PaymentGatewayController } from './controllers/payment-gateway.controller';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'users_registration',
      useFactory(config: ConfigService<ConfigInterface>) {
        const { attempts, delay } = config.get('bull', { infer: true });

        return {
          defaultJobOptions: {
            attempts,
            backoff: {
              type: 'fixed',
              delay,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
    HttpModule,
    UserModule,
    TypeOrmModule.forFeature([
      PrimeTrustUserEntity,
      PrimeTrustAccountEntity,
      PrimeTrustContactEntity,
      PrimeTrustKycDocumentEntity,
    ]),
  ],
  providers: [
    PaymentGatewayService,
    PaymentGatewayManager,
    PrimeTrustService,
    PaymentGatewayQueueHandler,
    PrimeTokenManager,
    PrimeUserManager,
    PrimeAccountManager,
    PrimeKycManager,
    PrimeWireManager,
  ],
  controllers: [PaymentGatewayController],
  exports: [PaymentGatewayManager],
})
export class PaymentGatewayModule {}
