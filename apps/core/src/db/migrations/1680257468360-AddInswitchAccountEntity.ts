import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInswitchAccountEntity1680257468360 implements MigrationInterface {
  name = 'AddInswitchAccountEntity1680257468360';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "inswitch_account" ("user_id" integer NOT NULL, "entity_id" integer NOT NULL, "wallet_id" integer, "payment_reference" character varying, CONSTRAINT "PK_c6befda55dbe7c2fb9fc2114e6a" PRIMARY KEY ("user_id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "inswitch_account"`);
  }
}
