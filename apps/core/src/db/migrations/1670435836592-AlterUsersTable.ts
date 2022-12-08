import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUsersTable2167043583659 implements MigrationInterface {
  name = 'AlterUsersTable21670435836592';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "name" TO "username"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "users_id_seq" OWNED BY "users"."id"`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT nextval('"users_id_seq"')`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phone" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT now()`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "updated_at" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "created_at" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phone" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT`);
    await queryRunner.query(`DROP SEQUENCE "users_id_seq"`);
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "username" TO "name"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "deleted_at" TIMESTAMP`);
  }
}
