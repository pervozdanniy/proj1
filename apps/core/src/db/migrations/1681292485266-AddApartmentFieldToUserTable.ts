import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddApartmentFieldToUserTable1681292485266 implements MigrationInterface {
  name = 'AddApartmentFieldToUserTable1681292485266';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_details" ADD "apartment" character varying(50)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_details" DROP COLUMN "apartment"`);
  }
}
