import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUserDetailsTable1681294188258 implements MigrationInterface {
  name = 'AlterUserDetailsTable1681294188258';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_details" ADD "apartment" character varying(50)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_details" DROP COLUMN "apartment"`);
  }
}
