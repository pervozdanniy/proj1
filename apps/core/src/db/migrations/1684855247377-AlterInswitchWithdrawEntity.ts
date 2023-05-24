import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterInswitchWithdrawEntity1684855247377 implements MigrationInterface {
  name = 'AlterInswitchWithdrawEntity1684855247377';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "inswitch_withdraw_authorization" DROP COLUMN "transferred_at"`);
    await queryRunner.query(
      `ALTER TABLE "inswitch_withdraw_authorization" ADD "entity_id" character varying(32) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "inswitch_withdraw_authorization" ADD "usd_rate" numeric NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "inswitch_withdraw_authorization" DROP COLUMN "usd_rate"`);
    await queryRunner.query(`ALTER TABLE "inswitch_withdraw_authorization" DROP COLUMN "entity_id"`);
    await queryRunner.query(`ALTER TABLE "inswitch_withdraw_authorization" ADD "transferred_at" TIMESTAMP`);
  }
}
