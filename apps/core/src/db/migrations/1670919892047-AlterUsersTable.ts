import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUsersTable1670919892047 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "payment_gateway" VARCHAR DEFAULT 'prime_trust'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "payment_gateway"`);
  }
}
