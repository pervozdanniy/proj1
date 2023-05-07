import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterSocureTable1682529569753 implements MigrationInterface {
  name = 'AlterSocureTable1682529569753';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "socure_kyc_documents" ADD "documentfront" character varying`);
    await queryRunner.query(`ALTER TABLE "socure_kyc_documents" ADD "documentback" character varying`);
    await queryRunner.query(`ALTER TABLE "socure_kyc_documents" ADD "profileimage" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "socure_kyc_documents" DROP COLUMN "profileimage"`);
    await queryRunner.query(`ALTER TABLE "socure_kyc_documents" DROP COLUMN "documentback"`);
    await queryRunner.query(`ALTER TABLE "socure_kyc_documents" DROP COLUMN "documentfront"`);
  }
}
