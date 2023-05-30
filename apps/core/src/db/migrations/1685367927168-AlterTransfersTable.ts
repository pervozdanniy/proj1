import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTransfersTable1685367927168 implements MigrationInterface {
  name = 'AlterTransfersTable1685367927168';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transfers" ADD "payment_type" character varying(50)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transfers" DROP COLUMN "payment_type"`);
  }
}
