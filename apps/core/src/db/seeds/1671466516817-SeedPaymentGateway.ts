import { MigrationInterface, QueryRunner } from 'typeorm';
import { PaymentGatewayEntity } from '~svc/core/src/user/entities/payment.gateway.entity';
import { CountryEntity } from '~svc/core/src/user/entities/country.entity';

export class SeedPaymentGateway1671466516817 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.save(
      queryRunner.manager.create<PaymentGatewayEntity>(PaymentGatewayEntity, {
        alias: 'prime_trust',
        name: 'Prime Trust',
      }),
    );
    const paymentGateway = await queryRunner.manager.findOne(PaymentGatewayEntity, { where: { alias: 'prime_trust' } });

    const country = await queryRunner.manager.save(
      queryRunner.manager.create<CountryEntity>(CountryEntity, {
        payment_gateway_id: paymentGateway.id,
        code: 'US',
        name: 'USA',
      }),
    );
    console.log(country);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE * FROM countries`);
    await queryRunner.query(`DELETE * FROM currency`);
  }
}
