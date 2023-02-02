import { MigrationInterface, QueryRunner } from 'typeorm';

export class CardResourceTable1675331507769 implements MigrationInterface {
  name = 'CardResourceTable1675331507769';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "card_resource" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "uuid" character varying(50) NOT NULL, "transfer_method_id" character varying(50), "credit_card_bin" character varying(50), "credit_card_type" character varying(50),"credit_card_name" character varying(50), "credit_card_expiration_date" character varying(50), "status" character varying(50), "token" character varying(50), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ac115e9f06d615a63a6243ac977" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "card_resource" ADD CONSTRAINT "FK_71761ea037b214a71b3942177ab" FOREIGN KEY ("user_id") REFERENCES "prime_trust_contacts"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "card_resource" DROP CONSTRAINT "FK_71761ea037b214a71b3942177ab"`);
    await queryRunner.query(`DROP TABLE "card_resource"`);
  }
}
