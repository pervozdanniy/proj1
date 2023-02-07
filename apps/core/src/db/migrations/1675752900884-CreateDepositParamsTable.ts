import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDepositParamsTable1675752900884 implements MigrationInterface {
  name = 'CreateDepositParamsTable1675752900884';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "deposit_params" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "uuid" character varying(50), "bank_account_id" integer, "funds_transfer_type" character varying(50), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_59c0103f8db1e108c3a613c68f0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "contributions" ADD "deposit_param_id" integer`);
    await queryRunner.query(
      `ALTER TABLE "contributions" ADD CONSTRAINT "FK_1aaf7883915988c19574342c02d" FOREIGN KEY ("deposit_param_id") REFERENCES "deposit_params"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "contributions" DROP CONSTRAINT "FK_1aaf7883915988c19574342c02d"`);
    await queryRunner.query(`ALTER TABLE "contributions" DROP COLUMN "deposit_param_id"`);
    await queryRunner.query(`DROP TABLE "deposit_params"`);
  }
}
