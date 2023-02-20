import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterWalletTable1676897676021 implements MigrationInterface {
  name = 'AlterWalletTable1676897676021';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "wallets" DROP COLUMN "wallet_for"`);
    await queryRunner.query(`DROP TYPE "public"."wallets_wallet_for_enum"`);
    await queryRunner.query(`ALTER TABLE "wallets" ADD "wallet_for" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "wallets" DROP COLUMN "wallet_for"`);
    await queryRunner.query(`CREATE TYPE "public"."wallets_wallet_for_enum" AS ENUM('deposit', 'withdrawal')`);
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD "wallet_for" "public"."wallets_wallet_for_enum" NOT NULL DEFAULT 'deposit'`,
    );
  }
}
