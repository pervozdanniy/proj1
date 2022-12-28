import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateKYCTables1671868325708 implements MigrationInterface {
  name = 'CreateKYCTables1671868325708';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "prime_kyc_documents" ("user_id" integer NOT NULL, "uuid" character varying NOT NULL, "label" character varying, "status" character varying NOT NULL, "kyc_check_uuid" character varying, "failure_details" character varying, "file_url" character varying NOT NULL, "extension" character varying NOT NULL, CONSTRAINT "PK_04aa3a17bfeb63b7a0f6455d292" PRIMARY KEY ("user_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "prime_trust_contacts" ("user_id" integer NOT NULL, "uuid" character varying NOT NULL, "first_name" character varying NOT NULL, "middle_name" character varying, "last_name" character varying NOT NULL, "identity_confirmed" boolean NOT NULL DEFAULT false, "identity_fingerprint" character varying NOT NULL DEFAULT false, "proof_of_address_documents_verified" boolean NOT NULL DEFAULT false, "identity_documents_verified" boolean NOT NULL DEFAULT false, "aml_cleared" boolean NOT NULL DEFAULT false, "cip_cleared" boolean NOT NULL DEFAULT false, CONSTRAINT "REL_867bca32ae1a76214ce3d41d72" UNIQUE ("user_id"), CONSTRAINT "PK_867bca32ae1a76214ce3d41d720" PRIMARY KEY ("user_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "prime_kyc_documents" ADD CONSTRAINT "FK_04aa3a17bfeb63b7a0f6455d292" FOREIGN KEY ("user_id") REFERENCES "prime_trust_contacts"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "prime_trust_contacts" ADD CONSTRAINT "FK_867bca32ae1a76214ce3d41d720" FOREIGN KEY ("user_id") REFERENCES "prime_trust_accounts"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prime_trust_contacts" DROP CONSTRAINT "FK_867bca32ae1a76214ce3d41d720"`);
    await queryRunner.query(`ALTER TABLE "prime_kyc_documents" DROP CONSTRAINT "FK_04aa3a17bfeb63b7a0f6455d292"`);
    await queryRunner.query(`DROP TABLE "prime_trust_contacts"`);
    await queryRunner.query(`DROP TABLE "prime_kyc_documents"`);
  }
}
