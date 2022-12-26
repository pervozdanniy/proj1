import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUserTableForSDKRegistration1671971668825 implements MigrationInterface {
  name = 'AlterUserTableForSDKRegistration1671971668825';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "source" character varying(50) NOT NULL DEFAULT 'api'`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "source"`);
  }
}
