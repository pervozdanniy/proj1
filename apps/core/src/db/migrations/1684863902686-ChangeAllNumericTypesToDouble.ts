import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeAllNumericTypesToDouble1684863902686 implements MigrationInterface {
  name = 'ChangeAllNumericTypesToDouble1684863902686';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transfers" ALTER COLUMN "amount" TYPE double precision USING "amount"::double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfers" ALTER COLUMN "fee" TYPE double precision USING "fee"::double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "deposit_flow" ALTER COLUMN "amount" TYPE double precision USING "amount"::double precision`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transfers" ALTER COLUMN "amount" TYPE numeric USING "amount"::numeric`);
    await queryRunner.query(`ALTER TABLE "transfers" ALTER COLUMN "fee" TYPE numeric USING "fee"::numeric`);
    await queryRunner.query(`ALTER TABLE "deposit_flow" ALTER COLUMN "amount" TYPE numeric USING "amount"::numeric`);
  }
}
