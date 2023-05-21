import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConverAllStringsToNumbers1684679871328 implements MigrationInterface {
  name = 'ConverAllStringsToNumbers1684679871328';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transfers" ALTER COLUMN "amount" TYPE numeric USING "amount"::numeric`);
    await queryRunner.query(`ALTER TABLE "transfers" ALTER COLUMN "fee" TYPE numeric USING "fee"::numeric`);
    await queryRunner.query(`ALTER TABLE "deposit_flow" ALTER COLUMN "amount" TYPE numeric USING "amount"::numeric`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "deposit_flow" ALTER COLUMN "amount" TYPE character varying`);
    await queryRunner.query(`ALTER TABLE "transfers" ALTER COLUMN "fee" TYPE character varying(50)`);
    await queryRunner.query(`ALTER TABLE "transfers" ALTER COLUMN "amount" TYPE character varying(50)`);
  }
}
