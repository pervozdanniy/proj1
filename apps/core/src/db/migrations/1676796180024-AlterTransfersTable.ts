import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTransfersTable1676796180024 implements MigrationInterface {
  name = 'AlterTransfersTable1676796180024';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "transfers" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "receiver_id" integer, "uuid" character varying(50), "param_id" integer, "param_type" character varying(50), "type" character varying(50), "amount" character varying(50), "fee" character varying(50), "currency_type" character varying(50), "status" character varying(50), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f712e908b465e0085b4408cabc3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfers" ADD CONSTRAINT "FK_ba27d1ebe999481ff98cfe51f6c" FOREIGN KEY ("user_id") REFERENCES "prime_trust_contacts"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transfers" DROP CONSTRAINT "FK_ba27d1ebe999481ff98cfe51f6c"`);
    await queryRunner.query(`DROP TABLE "transfers"`);
  }
}
