import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserContactTable1673371635929 implements MigrationInterface {
  name = 'AddUserContactTable1673371635929';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_contact" ("user_id" integer NOT NULL, "phone" character varying(20) NOT NULL, "contact_id" integer, CONSTRAINT "PK_5e2db38fe9984ce8a83efcf6fe3" PRIMARY KEY ("user_id", "phone"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_contact"`);
  }
}
