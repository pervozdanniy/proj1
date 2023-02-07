import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBankAccountsTable1675444112418 implements MigrationInterface {
  name = 'CreateBankAccountsTable1675444112418';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "bank_accounts" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "bank_account_name" character varying(50), "bank_account_number" character varying(50), "routing_number" character varying(50), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c872de764f2038224a013ff25ed" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "bank_accounts" ADD CONSTRAINT "FK_29146c4a8026c77c712e01d922b" FOREIGN KEY ("user_id") REFERENCES "prime_trust_contacts"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bank_accounts" DROP CONSTRAINT "FK_29146c4a8026c77c712e01d922b"`);
    await queryRunner.query(`DROP TABLE "bank_accounts"`);
  }
}
