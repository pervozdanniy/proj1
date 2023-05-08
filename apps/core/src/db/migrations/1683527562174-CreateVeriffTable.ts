import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVeriffTable1683527562174 implements MigrationInterface {
  name = 'CreateVeriffTable1683527562174';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "veriff_kyc_documents" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "session_id" character varying NOT NULL, "attempt_id" character varying NOT NULL, "issuing_date" character varying, "expiration_date" character varying, "document_number" character varying, "label" character varying, "document_front" character varying, "document_back" character varying, "profile_image" character varying, "status" character varying NOT NULL, "failure_details" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_7f00e69eaa92c950f20a57cacd0" UNIQUE ("session_id"), CONSTRAINT "UQ_29d8a5021959c9162912fb72cf8" UNIQUE ("attempt_id"), CONSTRAINT "PK_225fda90306745f497b1ab09d4d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "deposit_flow" ALTER COLUMN "resource_type" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "veriff_kyc_documents" ADD CONSTRAINT "FK_5a6a6ffd5f4840099294f4fdc54" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`DROP TABLE "socure_kyc_documents"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "veriff_kyc_documents" DROP CONSTRAINT "FK_5a6a6ffd5f4840099294f4fdc54"`);
    await queryRunner.query(`ALTER TABLE "deposit_flow" ALTER COLUMN "resource_type" SET DEFAULT '0'`);
    await queryRunner.query(`DROP TABLE "veriff_kyc_documents"`);
    await queryRunner.query(
      `CREATE TABLE "socure_kyc_documents" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "uuid" character varying NOT NULL, "issuing_date" character varying, "expiration_date" character varying, "document_number" character varying, "label" character varying, "status" character varying NOT NULL, "failure_details" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1dcbcbf8d388393adade4866a45" PRIMARY KEY ("id"))`,
    );
  }
}
