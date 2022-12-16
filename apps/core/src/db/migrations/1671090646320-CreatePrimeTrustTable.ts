import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePrimeTrustTable1671090646320 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "prime_trust_users"(
                                            id SERIAL PRIMARY KEY,
                                            uuid VARCHAR(255),
                                            user_id INT REFERENCES users(id) ON DELETE CASCADE,
                                            name VARCHAR(255) NOT NULL,
                                            email VARCHAR(255) NOT NULL UNIQUE,
                                            disabled BOOLEAN,
                                            status VARCHAR(255) NOT NULL DEFAULT 'pending',
                                            password  VARCHAR(255) NOT NULL,
                                            created_at TIMESTAMP,
                                            updated_at TIMESTAMP
                                );`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE prime_trust_users`);
  }
}
