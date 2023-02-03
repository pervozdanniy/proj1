import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTransferFundsTable1675409446505 implements MigrationInterface {
  name = 'CreateTransferFundsTable1675409446505';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "transfer_funds" ("id" SERIAL NOT NULL, "sender_id" integer NOT NULL, "receiver_id" integer NOT NULL, "uuid" character varying(50) NOT NULL, "amount" character varying(50), "currency_type" character varying(50), "status" character varying(50), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e996269794bbecea92037e0facc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "card_resource" ADD "credit_card_name" character varying(50)`);
    await queryRunner.query(
      `ALTER TABLE "transfer_funds" ADD CONSTRAINT "FK_462d56970979acca9ddd21547bc" FOREIGN KEY ("sender_id") REFERENCES "prime_trust_contacts"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transfer_funds" DROP CONSTRAINT "FK_462d56970979acca9ddd21547bc"`);
    await queryRunner.query(`ALTER TABLE "card_resource" DROP COLUMN "credit_card_name"`);
    await queryRunner.query(`DROP TABLE "transfer_funds"`);
  }
}
