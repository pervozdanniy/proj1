import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInswitchWitdrawEntity1684326195932 implements MigrationInterface {
  name = 'AddInswitchWitdrawEntity1684326195932';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "inswitch_withdraw_entity" ("id" SERIAL NOT NULL, "amount" numeric NOT NULL, "status" smallint NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f2da6de1d242ab03ac8a037a420" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "inswitch_withdraw_entity"`);
  }
}
