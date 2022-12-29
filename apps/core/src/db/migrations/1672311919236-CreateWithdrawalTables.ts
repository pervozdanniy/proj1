import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWithdrawalTables1672311919236 implements MigrationInterface {
  name = 'CreateWithdrawalTables1672311919236';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "withdrawals" ("user_id" integer NOT NULL, "uuid" character varying(50), "params_id" integer NOT NULL, "amount" character varying(50), "status" character varying(50), "currency_type" character varying(50), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0bd35ddb3acfb323ae3e024d2f8" PRIMARY KEY ("user_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "withdrawal_params" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "uuid" character varying(50), "bank_account_name" character varying(50), "bank_account_number" character varying(50), "routing_number" character varying(50), "funds_transfer_type" character varying(50), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_428e3b18ab3b4d0e2e6a4f9d5c8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "prime_trust_balance" DROP CONSTRAINT "FK_764c5658b6d4cb0234d4d8c69b2"`);
    await queryRunner.query(
      `ALTER TABLE "prime_trust_balance" ADD CONSTRAINT "UQ_764c5658b6d4cb0234d4d8c69b2" UNIQUE ("user_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "withdrawals" ADD CONSTRAINT "FK_e88384bc39e76317b02effba64f" FOREIGN KEY ("params_id") REFERENCES "withdrawal_params"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "withdrawal_params" ADD CONSTRAINT "FK_067f80f3d1b575c989d0d8d776b" FOREIGN KEY ("user_id") REFERENCES "prime_trust_contacts"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "prime_trust_balance" ADD CONSTRAINT "FK_764c5658b6d4cb0234d4d8c69b2" FOREIGN KEY ("user_id") REFERENCES "prime_trust_accounts"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prime_trust_balance" DROP CONSTRAINT "FK_764c5658b6d4cb0234d4d8c69b2"`);
    await queryRunner.query(`ALTER TABLE "withdrawal_params" DROP CONSTRAINT "FK_067f80f3d1b575c989d0d8d776b"`);
    await queryRunner.query(`ALTER TABLE "withdrawals" DROP CONSTRAINT "FK_e88384bc39e76317b02effba64f"`);
    await queryRunner.query(`ALTER TABLE "prime_trust_balance" DROP CONSTRAINT "UQ_764c5658b6d4cb0234d4d8c69b2"`);
    await queryRunner.query(
      `ALTER TABLE "prime_trust_balance" ADD CONSTRAINT "FK_764c5658b6d4cb0234d4d8c69b2" FOREIGN KEY ("user_id") REFERENCES "prime_trust_accounts"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`DROP TABLE "withdrawal_params"`);
    await queryRunner.query(`DROP TABLE "withdrawals"`);
  }
}
