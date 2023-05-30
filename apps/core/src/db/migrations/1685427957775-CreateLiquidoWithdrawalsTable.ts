import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLiquidoWithdrawalsTable1685427957775 implements MigrationInterface {
  name = 'CreateLiquidoWithdrawalsTable1685427957775';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "liquido_withdraw_authorization" ("id" SERIAL NOT NULL, "transfer_id" integer NOT NULL, "amount" double precision, "amount_usd" double precision, "currency" character(3) NOT NULL, "status" smallint NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_25704f664aee06ffea886ec1fdd" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "liquido_withdraw_authorization"`);
  }
}
