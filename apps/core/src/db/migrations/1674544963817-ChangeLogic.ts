import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeLogic1674544963817 implements MigrationInterface {
  name = 'ChangeLogic1674544963817';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prime_trust_users" DROP CONSTRAINT "FK_bc82792e39d720d4bd34c4cfd96"`);
    await queryRunner.query(`ALTER TABLE "prime_trust_accounts" DROP CONSTRAINT "FK_6343b28bf90b16dd4e0d1dee67e"`);
    await queryRunner.query(`ALTER TABLE "prime_trust_balance" DROP CONSTRAINT "FK_764c5658b6d4cb0234d4d8c69b2"`);
    await queryRunner.query(`ALTER TABLE "prime_trust_contacts" DROP CONSTRAINT "FK_867bca32ae1a76214ce3d41d720"`);
    await queryRunner.query(`ALTER TABLE "prime_trust_accounts" DROP CONSTRAINT "prime_trust_accounts_user_id_key"`);
    await queryRunner.query(
      `ALTER TABLE "prime_trust_contacts" ADD CONSTRAINT "FK_867bca32ae1a76214ce3d41d720" FOREIGN KEY ("user_id") REFERENCES "prime_trust_accounts"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "prime_trust_balance" ADD CONSTRAINT "FK_764c5658b6d4cb0234d4d8c69b2" FOREIGN KEY ("user_id") REFERENCES "prime_trust_contacts"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prime_trust_balance" DROP CONSTRAINT "FK_764c5658b6d4cb0234d4d8c69b2"`);
    await queryRunner.query(`ALTER TABLE "prime_trust_contacts" DROP CONSTRAINT "FK_867bca32ae1a76214ce3d41d720"`);
    await queryRunner.query(
      `ALTER TABLE "prime_trust_accounts" ADD CONSTRAINT "prime_trust_accounts_user_id_key" UNIQUE ("user_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "prime_trust_contacts" ADD CONSTRAINT "FK_867bca32ae1a76214ce3d41d720" FOREIGN KEY ("user_id") REFERENCES "prime_trust_accounts"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "prime_trust_balance" ADD CONSTRAINT "FK_764c5658b6d4cb0234d4d8c69b2" FOREIGN KEY ("user_id") REFERENCES "prime_trust_accounts"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "prime_trust_accounts" ADD CONSTRAINT "FK_6343b28bf90b16dd4e0d1dee67e" FOREIGN KEY ("user_id") REFERENCES "prime_trust_users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "prime_trust_users" ADD CONSTRAINT "FK_bc82792e39d720d4bd34c4cfd96"`);
  }
}
