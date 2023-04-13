import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSocialIdInUsersTable1681379332794 implements MigrationInterface {
    name = 'AddSocialIdInUsersTable1681379332794'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "social_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "social_id"`);
    }

}
