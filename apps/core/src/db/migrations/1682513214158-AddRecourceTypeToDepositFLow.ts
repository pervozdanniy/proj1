import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRecourceTypeToDepositFLow1682513214158 implements MigrationInterface {
  name = 'AddRecourceTypeToDepositFLow1682513214158';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "deposit_flow" ADD "resource_type" smallint NOT NULL DEFAULT 0`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "deposit_flow" DROP COLUMN "resource_type"`);
  }
}
