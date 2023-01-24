import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropPrimeUsers1674545919902 implements MigrationInterface {
  name = 'DropPrimeUsers1674545919902';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE prime_trust_users`);
    await queryRunner.query(`ALTER TABLE "prime_trust_contacts" DROP CONSTRAINT "FK_867bca32ae1a76214ce3d41d720"`);
    await queryRunner.query(
      `ALTER TABLE "prime_trust_accounts" ADD CONSTRAINT "UQ_6343b28bf90b16dd4e0d1dee67e" UNIQUE ("user_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "prime_trust_accounts" ADD CONSTRAINT "FK_6343b28bf90b16dd4e0d1dee67e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "prime_trust_contacts" ADD CONSTRAINT "FK_867bca32ae1a76214ce3d41d720" FOREIGN KEY ("user_id") REFERENCES "prime_trust_accounts"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE prime_trust_users`);
    await queryRunner.query(`ALTER TABLE "prime_trust_contacts" DROP CONSTRAINT "FK_867bca32ae1a76214ce3d41d720"`);
    await queryRunner.query(`ALTER TABLE "prime_trust_accounts" DROP CONSTRAINT "FK_6343b28bf90b16dd4e0d1dee67e"`);
    await queryRunner.query(`ALTER TABLE "prime_trust_accounts" DROP CONSTRAINT "UQ_6343b28bf90b16dd4e0d1dee67e"`);
    await queryRunner.query(
      `ALTER TABLE "prime_trust_contacts" ADD CONSTRAINT "FK_867bca32ae1a76214ce3d41d720" FOREIGN KEY ("user_id") REFERENCES "prime_trust_accounts"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
