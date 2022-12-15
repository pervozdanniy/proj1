import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCountriesTable1671025190389 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "payment_gateways"(
                                                                id SERIAL PRIMARY KEY,
                                                                alias VARCHAR(255) NOT NULL
                                                                name VARCHAR(255) NOT NULL);`);
    await queryRunner.query(`CREATE TABLE "countries"(
                                               id SERIAL PRIMARY KEY,
                                               payment_gateway_id INT REFERENCES payment_gateways(id),
                                               code VARCHAR(255) NOT NULL,
                                               name VARCHAR(255) NOT NULL);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE payment_gateways`);
    await queryRunner.query(`DROP TABLE countries`);
  }
}
