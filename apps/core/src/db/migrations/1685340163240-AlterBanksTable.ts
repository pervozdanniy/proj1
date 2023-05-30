import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterBanksTable1685340163240 implements MigrationInterface {
  name = 'AlterBanksTable1685340163240';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bank_accounts" ADD "bank_agency_code" character varying(50)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bank_accounts" DROP COLUMN "bank_agency_code"`);
  }
}
