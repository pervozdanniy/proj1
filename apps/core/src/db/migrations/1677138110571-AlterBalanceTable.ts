import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterBalanceTable1677138110571 implements MigrationInterface {
    name = 'AlterBalanceTable1677138110571'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_details" DROP COLUMN "avatar"`);
        await queryRunner.query(`ALTER TABLE "prime_trust_balance" DROP COLUMN "disbursable"`);
        await queryRunner.query(`ALTER TABLE "prime_trust_balance" DROP COLUMN "pending_transfer"`);
        await queryRunner.query(`ALTER TABLE "prime_trust_balance" DROP COLUMN "contingent_hold"`);
        await queryRunner.query(`ALTER TABLE "prime_trust_balance" DROP COLUMN "non_contingent_hold"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "prime_trust_balance" ADD "non_contingent_hold" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "prime_trust_balance" ADD "contingent_hold" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "prime_trust_balance" ADD "pending_transfer" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "prime_trust_balance" ADD "disbursable" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user_details" ADD "avatar" character varying`);
    }

}
