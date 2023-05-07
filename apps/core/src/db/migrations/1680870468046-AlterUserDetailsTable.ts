import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUserDetailsTable1680870468046 implements MigrationInterface {
  name = 'AlterUserDetailsTable1680870468046';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_details" DROP COLUMN "document_uuid"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_details" ADD "document_uuid" character varying(50)`);
  }
}
