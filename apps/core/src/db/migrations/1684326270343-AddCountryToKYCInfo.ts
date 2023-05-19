import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCountryToKYCInfo1684326270343 implements MigrationInterface {
  name = 'AddCountryToKYCInfo1684326270343';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "veriff_kyc_documents" ADD "country" character(2)`);
    await queryRunner.query(
      `UPDATE veriff_kyc_documents SET country = u.country_code FROM users u WHERE veriff_kyc_documents.user_id = u.id`,
    );
    await queryRunner.query(`ALTER TABLE "veriff_kyc_documents" ALTER COLUMN "country" SET NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "veriff_kyc_documents" DROP COLUMN "country"`);
  }
}
