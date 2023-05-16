import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInswitchCardsAndAccountsEntities1683650125085 implements MigrationInterface {
  name = 'AddInswitchCardsAndAccountsEntities1683650125085';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "inswitch_card" ("reference" uuid NOT NULL, "account_id" integer NOT NULL, "type" smallint NOT NULL, "currency" character(3) NOT NULL, "pan" character varying(20) NOT NULL, "payment_method_ref" character varying(50) NOT NULL, CONSTRAINT "PK_6c2575cb508210dc5b9d00bb69d" PRIMARY KEY ("reference"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "inswitch_account" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "country" character(2) NOT NULL, "entity_id" character varying(32) NOT NULL, "wallet_id" character varying(32), "payment_reference" character varying, CONSTRAINT "PK_dac31a09443d16d97bd7eff30d9" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "inswitch_account"`);
    await queryRunner.query(`DROP TABLE "inswitch_card"`);
  }
}
