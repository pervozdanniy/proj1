import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeNotificationEntity1685024382736 implements MigrationInterface {
  name = 'ChangeNotificationEntity1685024382736';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notifications" ADD "payload" text`);
    await queryRunner.query(
      `UPDATE "notifications" SET payload = json_build_object('title', "title", 'description', "description")`,
    );
    await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "title"`);
    await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "description"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "payload"`);
    await queryRunner.query(`ALTER TABLE "notifications" ADD "description" character varying`);
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "title" character varying NOT NULL DEFAULT 'notification'`,
    );
  }
}
