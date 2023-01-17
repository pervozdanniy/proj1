import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUsersDetailsTable1673962495209 implements MigrationInterface {
  name = 'AlterUsersDetailsTable1673962495209';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."user_details_send_type_enum" AS ENUM('all', 'email', 'sms')`);
    await queryRunner.query(
      `ALTER TABLE "user_details" ADD "send_type" "public"."user_details_send_type_enum" NOT NULL DEFAULT 'email'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_details" DROP COLUMN "send_type"`);
    await queryRunner.query(`DROP TYPE "public"."user_details_send_type_enum"`);
  }
}
