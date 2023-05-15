import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRefreshTokenEntity1680877145270 implements MigrationInterface {
  name = 'CreateRefreshTokenEntity1680877145270';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "refresh_token" ("id" SERIAL NOT NULL, "family" character varying(24) NOT NULL, CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "refresh_token"`);
  }
}
