import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUsersTable1671025295745 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "country_id" INT NOT NULL `);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "status" VARCHAR NOT NULL DEFAULT 'active'`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT fk_countries_customers FOREIGN KEY (country_id) REFERENCES "countries" (id);`,
    );
    await queryRunner.query(`CREATE UNIQUE INDEX idx_users_email ON users(email);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "country_id"`);
  }
}
