import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHotWalletParams1681741975606 implements MigrationInterface {
  name = 'AddHotWalletParams1681741975606';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prime_trust_balance" ADD "hot_balance" double precision DEFAULT '0'`);
    await queryRunner.query(`ALTER TABLE "prime_trust_balance" ADD "cold_balance" double precision DEFAULT '0'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prime_trust_balance" DROP COLUMN "cold_balance"`);
    await queryRunner.query(`ALTER TABLE "prime_trust_balance" DROP COLUMN "hot_balance"`);
  }
}
