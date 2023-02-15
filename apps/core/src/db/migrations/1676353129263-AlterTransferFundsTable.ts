import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTransferFundsTable1676353129263 implements MigrationInterface {
  name = 'AlterTransferFundsTable1676353129263';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transfer_funds" ADD "fee_amount" character varying(50)`);
    await queryRunner.query(`ALTER TABLE "transfer_funds" ADD "total_amount" character varying(50)`);
    await queryRunner.query(`ALTER TABLE "transfer_funds" ADD "unit_count" character varying(50)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transfer_funds" DROP COLUMN "unit_count"`);
    await queryRunner.query(`ALTER TABLE "transfer_funds" DROP COLUMN "total_amount"`);
    await queryRunner.query(`ALTER TABLE "transfer_funds" DROP COLUMN "fee_amount"`);
  }
}
