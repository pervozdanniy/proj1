import { MigrationInterface, QueryRunner } from 'typeorm';

export class createUserDetailsTable1671438132874 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "user_details"(
                                            id SERIAL PRIMARY KEY,
                                            user_id INT REFERENCES users(id) ON DELETE CASCADE,
                                            first_name VARCHAR(50),
                                            last_name VARCHAR(50),
                                            date_of_birth VARCHAR(50),
                                            city VARCHAR(50),
                                            street VARCHAR(50),
                                            postal_code INT,
                                            tax_id_number INT,
                                            created_at TIMESTAMP,
                                            updated_at TIMESTAMP
                                );`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_details"`);
  }
}
