import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTransfersTable1680249255329 implements MigrationInterface {
  name = 'AlterTransfersTable1680249255329';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transfers" ADD "provider" character varying(50)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transfers" DROP COLUMN "provider"`);
  }
}
