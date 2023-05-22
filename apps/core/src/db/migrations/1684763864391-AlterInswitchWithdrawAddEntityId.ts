import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterInswitchWithdrawAddEntityId1684763864391 implements MigrationInterface {
  name = 'AlterInswitchWithdrawAddEntityId1684763864391';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "inswitch_withdraw_authorization" ADD "entity_id" character varying(32) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "inswitch_withdraw_authorization" DROP COLUMN "entity_id"`);
  }
}
