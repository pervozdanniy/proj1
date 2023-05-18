import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRatesTable1684337666959 implements MigrationInterface {
    name = 'CreateRatesTable1684337666959'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "rates" ("id" SERIAL NOT NULL, "currency" character varying(10) NOT NULL, "rate" character varying(10) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2c804ed4019b80ce48eedba5cec" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "rates"`);
    }

}
