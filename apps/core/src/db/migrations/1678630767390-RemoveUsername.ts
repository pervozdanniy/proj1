import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUsername1678630767390 implements MigrationInterface {
  name = 'RemoveUsername1678630767390';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username"`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "country_code" DROP DEFAULT`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "country_code" SET DEFAULT 'US'`);
    await queryRunner.query(`ALTER TABLE "users" ADD "username" character varying NOT NULL`);
  }
}
