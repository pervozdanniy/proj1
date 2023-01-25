import { MigrationInterface, QueryRunner } from 'typeorm';
import { CountryEntity } from '~svc/core/src/country/entities/country.entity';
import { PaymentGatewayEntity } from '~svc/core/src/payment-gateway/entities/payment-gateway.entity';

export class SeedPaymentGateway1671466516817 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.save(
      queryRunner.manager.create<PaymentGatewayEntity>(PaymentGatewayEntity, {
        alias: 'prime_trust',
        name: 'Prime Trust',
      }),
    );
    const paymentGateway = await queryRunner.manager.findOne(PaymentGatewayEntity, { where: { alias: 'prime_trust' } });

    await queryRunner.manager.save(
      queryRunner.manager.create<CountryEntity>(CountryEntity, {
        payment_gateway_id: paymentGateway.id,
        code: 'US',
        name: 'USA',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE * FROM countries`);
    await queryRunner.query(`DELETE * FROM currency`);
  }
}