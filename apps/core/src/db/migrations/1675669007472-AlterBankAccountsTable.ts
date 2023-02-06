import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterBankAccountsTable1675669007472 implements MigrationInterface {
  name = 'AlterBankAccountsTable1675669007472';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."bank_accounts_type_enum" AS ENUM('checking', 'savings')`);
    await queryRunner.query(
      `ALTER TABLE "bank_accounts" ADD "type" "public"."bank_accounts_type_enum" NOT NULL DEFAULT 'checking'`,
    );
    await queryRunner.query(`CREATE TYPE "public"."bank_accounts_ach_check_type_enum" AS ENUM('personal', 'business')`);
    await queryRunner.query(
      `ALTER TABLE "bank_accounts" ADD "ach_check_type" "public"."bank_accounts_ach_check_type_enum" NOT NULL DEFAULT 'personal'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bank_accounts" DROP COLUMN "ach_check_type"`);
    await queryRunner.query(`DROP TYPE "public"."bank_accounts_ach_check_type_enum"`);
    await queryRunner.query(`ALTER TABLE "bank_accounts" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."bank_accounts_type_enum"`);
  }
}
