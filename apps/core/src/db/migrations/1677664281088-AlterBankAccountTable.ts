import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterBankAccountTable1677664281088 implements MigrationInterface {
  name = 'AlterBankAccountTable1677664281088';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bank_accounts" ADD "bank_code" character varying(50)`);
    await queryRunner.query(`ALTER TABLE "bank_accounts" ADD "account_uuid" character varying(50)`);
    await queryRunner.query(`ALTER TABLE "bank_accounts" ADD "account" character varying(50)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bank_accounts" DROP COLUMN "account"`);
    await queryRunner.query(`ALTER TABLE "bank_accounts" DROP COLUMN "account_uuid"`);
    await queryRunner.query(`ALTER TABLE "bank_accounts" DROP COLUMN "bank_code"`);
  }
}
