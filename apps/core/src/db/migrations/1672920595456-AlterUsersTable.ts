import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterUsersTable1672920595456 implements MigrationInterface {
    name = 'AlterUsersTable1672920595456'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "country_id" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "country_id" SET NOT NULL`);
    }

}
