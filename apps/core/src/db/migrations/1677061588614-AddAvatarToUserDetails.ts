import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAvatarToUserDetails1677061588614 implements MigrationInterface {
  name = 'AddAvatarToUserDetails1677061588614';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_details" ADD "avatar" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_details" DROP COLUMN "avatar"`);
  }
}
