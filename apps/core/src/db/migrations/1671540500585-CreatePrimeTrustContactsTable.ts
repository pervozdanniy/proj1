import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePrimeTrustContactsTable1671540500585 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "prime_trust_contacts"(
                                            id SERIAL PRIMARY KEY,
                                            account_id INT REFERENCES prime_trust_accounts(id) ON DELETE CASCADE UNIQUE,
                                            uuid VARCHAR(50),
                                            first_name VARCHAR(50),
                                            middle_name VARCHAR(50),
                                            last_name VARCHAR(50),
                                            identity_fingerprint VARCHAR(50),
                                            proof_of_address_documents_verified BOOLEAN DEFAULT FALSE,
                                            identity_confirmed BOOLEAN DEFAULT FALSE,
                                            identity_documents_verified BOOLEAN DEFAULT FALSE,
                                            aml_cleared BOOLEAN DEFAULT FALSE,
                                            cip_cleared BOOLEAN DEFAULT FALSE
                                );`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "prime_trust_contacts"`);
  }
}
