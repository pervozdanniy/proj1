import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterLinksTable1683899714681 implements MigrationInterface {
    name = 'AlterLinksTable1683899714681'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "links" DROP CONSTRAINT "UQ_64c97bb1b254cb7118e5dc9c4ee"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "links" ADD CONSTRAINT "UQ_64c97bb1b254cb7118e5dc9c4ee" UNIQUE ("customer_id")`);
    }

}
