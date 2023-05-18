import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterInswitchCardENtity1684413645851 implements MigrationInterface {
  name = 'AlterInswitchCardENtity1684413645851';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "inswitch_card" DROP COLUMN "payment_method_ref"`);
    await queryRunner.query(`ALTER TABLE "inswitch_card" ADD "status" character varying(16) NOT NULL`);
    await queryRunner.query(`ALTER TABLE "inswitch_card" ALTER COLUMN "pan" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "inswitch_card" ALTER COLUMN "pan" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "inswitch_card" DROP COLUMN "status"`);
    await queryRunner.query(`ALTER TABLE "inswitch_card" ADD "payment_method_ref" character varying(50) NOT NULL`);
  }
}
