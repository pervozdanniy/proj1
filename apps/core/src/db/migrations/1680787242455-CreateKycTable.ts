import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateKycTable1680787242455 implements MigrationInterface {
  name = 'CreateKycTable1680787242455';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "socure_kyc_documents" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "uuid" character varying NOT NULL, "issuing_date" character varying, "expiration_date" character varying, "document_number" character varying, "label" character varying, "status" character varying NOT NULL, "failure_details" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1dcbcbf8d388393adade4866a45" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "user_details" DROP COLUMN "socure_verify"`);
    await queryRunner.query(
      `ALTER TABLE "socure_kyc_documents" ADD CONSTRAINT "FK_2e6cd18e419fbc318b5913ca85b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "socure_kyc_documents" DROP CONSTRAINT "FK_2e6cd18e419fbc318b5913ca85b"`);
    await queryRunner.query(`ALTER TABLE "user_details" ADD "socure_verify" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`DROP TABLE "socure_kyc_documents"`);
  }
}
