import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAccountsTable1674501175461 implements MigrationInterface {
  name = 'AlterAccountsTable1674501175461';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prime_trust_accounts" RENAME COLUMN "user_id" TO "id"`);
    await queryRunner.query(
      `ALTER TABLE "prime_trust_accounts" RENAME CONSTRAINT "PK_6343b28bf90b16dd4e0d1dee67e" TO "PK_86ee86acf1e33dfb01f0d359285"`,
    );
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS "prime_trust_accounts_id_seq" OWNED BY "prime_trust_accounts"."id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "prime_trust_accounts" ALTER COLUMN "id" SET DEFAULT nextval('"prime_trust_accounts_id_seq"')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prime_trust_accounts" ALTER COLUMN "id" DROP DEFAULT`);
    await queryRunner.query(`DROP SEQUENCE "prime_trust_accounts_id_seq"`);
    await queryRunner.query(
      `ALTER TABLE "prime_trust_accounts" RENAME CONSTRAINT "PK_86ee86acf1e33dfb01f0d359285" TO "PK_6343b28bf90b16dd4e0d1dee67e"`,
    );
    await queryRunner.query(`ALTER TABLE "prime_trust_accounts" RENAME COLUMN "id" TO "user_id"`);
  }
}
