import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDepositFlowEntity1682250487665 implements MigrationInterface {
  name = 'AddDepositFlowEntity1682250487665';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "deposit_flow" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "amount" character varying NOT NULL, "currency" character(3) NOT NULL, "country_code" character(2) NOT NULL, CONSTRAINT "PK_88a37914a2931721b603fc465f6" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "deposit_flow"`);
  }
}
