import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterCardResourceTable1676270704886 implements MigrationInterface {
  name = 'AlterCardResourceTable1676270704886';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "card_resource" DROP CONSTRAINT "FK_71761ea037b214a71b3942177ab"`);
    await queryRunner.query(`ALTER TABLE "contributions" ADD "card_resource_id" integer`);
    await queryRunner.query(
      `ALTER TABLE "contributions" ADD CONSTRAINT "FK_c217930a2042c4eca17ece9be78" FOREIGN KEY ("card_resource_id") REFERENCES "card_resource"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "contributions" DROP CONSTRAINT "FK_c217930a2042c4eca17ece9be78"`);
    await queryRunner.query(`ALTER TABLE "contributions" DROP COLUMN "card_resource_id"`);
    await queryRunner.query(
      `ALTER TABLE "card_resource" ADD CONSTRAINT "FK_71761ea037b214a71b3942177ab" FOREIGN KEY ("user_id") REFERENCES "prime_trust_contacts"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
