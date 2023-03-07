import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveCountryEntity1678111485298 implements MigrationInterface {
  name = 'RemoveCountryEntity1678111485298';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "country_id"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "country_code" character(2) NOT NULL DEFAULT 'US'`);
    await queryRunner.query('DROP TABLE "countries"');
    await queryRunner.query('DROP TABLE "payment_gateways"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "country_code"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "country_id" integer`);
    await queryRunner.query(`CREATE TABLE "payment_gateways"(
        id SERIAL PRIMARY KEY,
        alias VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL)`);
    await queryRunner.query(`CREATE TABLE "countries"(
        id SERIAL PRIMARY KEY,
        payment_gateway_id INT REFERENCES payment_gateways(id) NOT NULL ,
        code VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL)`);
  }
}
