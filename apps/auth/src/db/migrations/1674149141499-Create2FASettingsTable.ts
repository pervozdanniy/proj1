import { MigrationInterface, QueryRunner } from 'typeorm';

export class Create2FASettingsTable1674149141499 implements MigrationInterface {
  name = 'Create2FASettingsTable1674149141499';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "two_factor_settings" ("user_id" integer NOT NULL, "method" character varying(20) NOT NULL, "destination" character varying, CONSTRAINT "PK_5040fd6a71f9fe75d6749265efd" PRIMARY KEY ("user_id", "method"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "two_factor_settings"`);
  }
}
