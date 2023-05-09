import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterVeriffTable1683530145156 implements MigrationInterface {
  name = 'AlterVeriffTable1683530145156';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "veriff_kyc_documents" ALTER COLUMN "attempt_id" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "veriff_kyc_documents" ALTER COLUMN "attempt_id" SET NOT NULL`);
  }
}
