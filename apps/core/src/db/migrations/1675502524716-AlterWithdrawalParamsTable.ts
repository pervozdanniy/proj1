import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterWithdrawalParamsTable1675502524716 implements MigrationInterface {
  name = 'AlterWithdrawalParamsTable1675502524716';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "withdrawal_params" DROP COLUMN "bank_account_name"`);
    await queryRunner.query(`ALTER TABLE "withdrawal_params" DROP COLUMN "bank_account_number"`);
    await queryRunner.query(`ALTER TABLE "withdrawal_params" DROP COLUMN "routing_number"`);
    await queryRunner.query(`ALTER TABLE "withdrawal_params" ADD "bank_account_id" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "withdrawal_params" DROP COLUMN "bank_account_id"`);
    await queryRunner.query(`ALTER TABLE "withdrawal_params" ADD "routing_number" character varying(50)`);
    await queryRunner.query(`ALTER TABLE "withdrawal_params" ADD "bank_account_number" character varying(50)`);
    await queryRunner.query(`ALTER TABLE "withdrawal_params" ADD "bank_account_name" character varying(50)`);
  }
}
