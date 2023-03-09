import { MigrationInterface, QueryRunner } from 'typeorm';

export class Alter2FARequireDestination1678273366673 implements MigrationInterface {
  name = 'Alter2FARequireDestination1678273366673';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "two_factor_settings" ALTER COLUMN "destination" SET NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "two_factor_settings" ALTER COLUMN "destination" DROP NOT NULL`);
  }
}
