import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterKycDocumentsTable1681553441656 implements MigrationInterface {
  name = 'AlterKycDocumentsTable1681553441656';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prime_kyc_documents" ALTER COLUMN "file_url" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "prime_kyc_documents" ALTER COLUMN "extension" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prime_kyc_documents" ALTER COLUMN "extension" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "prime_kyc_documents" ALTER COLUMN "file_url" SET NOT NULL`);
  }
}
