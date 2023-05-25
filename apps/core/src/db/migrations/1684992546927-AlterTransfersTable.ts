import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTransfersTable1684992546927 implements MigrationInterface {
  name = 'AlterTransfersTable1684992546927';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transfers" ADD "amount_usd" double precision`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transfers" DROP COLUMN "amount_usd"`);
  }
}
