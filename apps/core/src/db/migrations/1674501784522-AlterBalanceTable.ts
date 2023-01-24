import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterBalanceTable1674501784522 implements MigrationInterface {
  name = 'AlterBalanceTable1674501784522';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prime_trust_balance" DROP CONSTRAINT "FK_764c5658b6d4cb0234d4d8c69b2"`);
    await queryRunner.query(
      `ALTER TABLE "prime_trust_balance" ADD CONSTRAINT "FK_764c5658b6d4cb0234d4d8c69b2" FOREIGN KEY ("user_id") REFERENCES "prime_trust_contacts"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prime_trust_balance" DROP CONSTRAINT "FK_764c5658b6d4cb0234d4d8c69b2"`);
    await queryRunner.query(
      `ALTER TABLE "prime_trust_balance" ADD CONSTRAINT "FK_764c5658b6d4cb0234d4d8c69b2" FOREIGN KEY ("user_id") REFERENCES "prime_trust_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
