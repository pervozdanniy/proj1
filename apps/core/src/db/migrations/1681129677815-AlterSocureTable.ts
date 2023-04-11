import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterSocureTable1681129677815 implements MigrationInterface {
  name = 'AlterSocureTable1681129677815';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "socure_kyc_documents" ADD CONSTRAINT "UQ_fa2e73a9df428e3c28e5e66feb0" UNIQUE ("uuid")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "socure_kyc_documents" DROP CONSTRAINT "UQ_fa2e73a9df428e3c28e5e66feb0"`);
  }
}
