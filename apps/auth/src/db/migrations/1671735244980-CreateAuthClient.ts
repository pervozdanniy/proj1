import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuthClient1671735244980 implements MigrationInterface {
  name = 'CreateAuthClient1671735244980';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "auth_client" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "key" character varying NOT NULL, "secret" text, CONSTRAINT "PK_2bf40f6fdea0aba0292591d5d7f" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "auth_client"`);
  }
}
