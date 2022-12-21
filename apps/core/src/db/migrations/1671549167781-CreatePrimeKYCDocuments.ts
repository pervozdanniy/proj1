import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePrimeKYCDocuments1671549167781 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "prime_kyc_documents"(
                                            id SERIAL PRIMARY KEY,
                                            contact_id INT REFERENCES prime_trust_contacts(id) ON DELETE CASCADE,
                                            status VARCHAR(50),
                                            uuid VARCHAR(255),
                                            kyc_check_uuid VARCHAR(255),
                                            label VARCHAR(50),
                                            file_url TEXT,
                                            extension VARCHAR(50)
                                );`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "prime_kyc_documents"`);
  }
}
