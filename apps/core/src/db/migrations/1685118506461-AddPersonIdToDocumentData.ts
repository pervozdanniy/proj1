import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPersonIdToDocumentData1685118506461 implements MigrationInterface {
  name = 'AddPersonIdToDocumentData1685118506461';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "veriff_kyc_documents" ADD "person_id_number" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "veriff_kyc_documents" DROP COLUMN "person_id_number"`);
  }
}
