import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAuthTable1681216028527 implements MigrationInterface {
  name = 'AlterAuthTable1681216028527';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "two_factor_settings" DROP COLUMN "destination"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "two_factor_settings" ADD "destination" character varying NOT NULL`);
  }
}
