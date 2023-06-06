import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInternalFee1685972292989 implements MigrationInterface {
  name = 'AddInternalFee1685972292989';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "fees" ("id" SERIAL NOT NULL, "country" character(2), "percent" double precision NOT NULL DEFAULT '0', "fixed_usd" double precision, CONSTRAINT "UQ_70894ee340b905d5f24a448b33f" UNIQUE ("country"), CONSTRAINT "PK_97f3a1b1b8ee5674fd4da93f461" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "transfers" ADD "internal_fee_usd" double precision`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transfers" DROP COLUMN "internal_fee_usd"`);
    await queryRunner.query(`DROP TABLE "fees"`);
  }
}
