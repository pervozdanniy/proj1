import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterInswitchCardsTable1686847368050 implements MigrationInterface {
  name = 'AlterInswitchCardsTable1686847368050';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "inswitch_withdraw_authorization" DROP COLUMN "usd_rate"`);
    await queryRunner.query(`ALTER TABLE "inswitch_card" ADD "is_active" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "inswitch_withdraw_authorization" ADD "amount_usd" numeric NOT NULL`);
    await queryRunner.query(`ALTER TABLE "inswitch_withdraw_authorization" ADD "fee_usd" numeric NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "inswitch_withdraw_authorization" DROP COLUMN "fee_usd"`);
    await queryRunner.query(`ALTER TABLE "inswitch_withdraw_authorization" DROP COLUMN "amount_usd"`);
    await queryRunner.query(`ALTER TABLE "inswitch_card" DROP COLUMN "is_active"`);
    await queryRunner.query(`ALTER TABLE "inswitch_withdraw_authorization" ADD "usd_rate" numeric NOT NULL`);
  }
}
