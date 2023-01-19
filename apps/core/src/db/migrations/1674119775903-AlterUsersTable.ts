import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUsersTable1674119775903 implements MigrationInterface {
  name = 'AlterUsersTable1674119775903';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_details" ADD "send_type" integer NOT NULL DEFAULT '1'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_details" DROP COLUMN "send_type"`);
  }
}
