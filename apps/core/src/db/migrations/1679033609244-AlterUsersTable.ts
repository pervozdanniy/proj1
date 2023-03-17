import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterUsersTable1679033609244 implements MigrationInterface {
    name = 'AlterUsersTable1679033609244'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_details" ADD "socure_verify" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user_details" ADD "document_uuid" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "user_details" ALTER COLUMN "send_type" SET DEFAULT '-1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_details" ALTER COLUMN "send_type" SET DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "user_details" DROP COLUMN "document_uuid"`);
        await queryRunner.query(`ALTER TABLE "user_details" DROP COLUMN "socure_verify"`);
    }

}
