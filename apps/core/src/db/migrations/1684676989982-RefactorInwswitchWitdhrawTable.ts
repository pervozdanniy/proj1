import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorInwswitchWitdhrawTable1684676989982 implements MigrationInterface {
  name = 'RefactorInwswitchWitdhrawTable1684676989982';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "inswitch_withdraw_entity"`);
    await queryRunner.query(
      `CREATE TABLE "inswitch_withdraw_authorization" ("id" character varying(64) NOT NULL, "amount" numeric NOT NULL, "currency" character(3) NOT NULL, "status" smallint NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "transferred_at" TIMESTAMP, CONSTRAINT "PK_ed45c915facda20d090b58f3e46" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "inswitch_withdraw_authorization"`);
    await queryRunner.query(
      `CREATE TABLE "inswitch_withdraw_entity" ("id" SERIAL NOT NULL, "amount" numeric NOT NULL, "status" smallint NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f2da6de1d242ab03ac8a037a420" PRIMARY KEY ("id"))`,
    );
  }
}
