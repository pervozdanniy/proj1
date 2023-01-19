import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUsersTable1674113895065 implements MigrationInterface {
  name = 'AlterUsersTable1674113895065';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."user_details_send_type_enum" AS ENUM('1', '2', '3')`);
    await queryRunner.query(
      `ALTER TABLE "user_details" ADD "send_type" "public"."user_details_send_type_enum" NOT NULL DEFAULT '1'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_details" DROP COLUMN "send_type"`);
    await queryRunner.query(`DROP TYPE "public"."user_details_send_type_enum"`);
  }
}
