import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLinkTable1683878337424 implements MigrationInterface {
  name = 'CreateLinkTable1683878337424';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "links" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "session_id" character varying NOT NULL, "customer_id" character varying, "status" character varying NOT NULL, "failure_details" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4d4c8cdfca5567d1677f51b4aef" UNIQUE ("session_id"), CONSTRAINT "UQ_64c97bb1b254cb7118e5dc9c4ee" UNIQUE ("customer_id"), CONSTRAINT "PK_ecf17f4a741d3c5ba0b4c5ab4b6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "links" ADD CONSTRAINT "FK_9f8dea86e48a7216c4f5369c1e4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "links" DROP CONSTRAINT "FK_9f8dea86e48a7216c4f5369c1e4"`);
    await queryRunner.query(`DROP TABLE "links"`);
  }
}
