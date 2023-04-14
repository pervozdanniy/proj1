import { MigrationInterface, QueryRunner } from 'typeorm';

export class GenerateRelationsTable1681477802578 implements MigrationInterface {
  name = 'GenerateRelationsTable1681477802578';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "deposit_params" ADD CONSTRAINT "FK_6dba8b1ab838375d4c4b6fdf638" FOREIGN KEY ("user_id") REFERENCES "prime_trust_contacts"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "card_resource" ADD CONSTRAINT "FK_71761ea037b214a71b3942177ab" FOREIGN KEY ("user_id") REFERENCES "prime_trust_contacts"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "card_resource" DROP CONSTRAINT "FK_71761ea037b214a71b3942177ab"`);
    await queryRunner.query(`ALTER TABLE "deposit_params" DROP CONSTRAINT "FK_6dba8b1ab838375d4c4b6fdf638"`);
  }
}
