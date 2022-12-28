import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBalanceTable1672139130150 implements MigrationInterface {
  name = 'CreateBalanceTable1672139130150';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "prime_trust_balance" ("user_id" integer NOT NULL, "settled" double precision NOT NULL DEFAULT '0', "disbursable" double precision NOT NULL DEFAULT '0', "pending_transfer" double precision NOT NULL DEFAULT '0', "currency_type" character varying NOT NULL, "contingent_hold" double precision NOT NULL DEFAULT '0', "non_contingent_hold" double precision NOT NULL DEFAULT '0', CONSTRAINT "REL_764c5658b6d4cb0234d4d8c69b" UNIQUE ("user_id"), CONSTRAINT "PK_764c5658b6d4cb0234d4d8c69b2" PRIMARY KEY ("user_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "prime_trust_balance" ADD CONSTRAINT "FK_764c5658b6d4cb0234d4d8c69b2" FOREIGN KEY ("user_id") REFERENCES "prime_trust_accounts"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prime_trust_balance" DROP CONSTRAINT "FK_764c5658b6d4cb0234d4d8c69b2"`);
    await queryRunner.query(`DROP TABLE "prime_trust_balance"`);
  }
}
