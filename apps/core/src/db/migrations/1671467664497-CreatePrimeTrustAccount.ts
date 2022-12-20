import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePrimeTrustAccount1671467664497 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "prime_trust_accounts"(
                                            id SERIAL PRIMARY KEY,
                                            user_id INT REFERENCES prime_trust_users(id) ON DELETE CASCADE UNIQUE ,
                                            uuid VARCHAR(50),
                                            name VARCHAR(50),
                                            number VARCHAR(50),
                                            contributions_frozen BOOLEAN,
                                            disbursements_frozen BOOLEAN,
                                            statements BOOLEAN,
                                            solid_freeze BOOLEAN,
                                            status VARCHAR(50),
                                            offline_cold_storage VARCHAR(50)
                                );`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "prime_trust_accounts"`);
  }
}
