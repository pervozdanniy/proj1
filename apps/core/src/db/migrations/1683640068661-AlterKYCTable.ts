import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterKYCTable1683640068661 implements MigrationInterface {
  name = 'AlterKYCTable1683640068661';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prime_kyc_documents" DROP CONSTRAINT "FK_04aa3a17bfeb63b7a0f6455d292"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "prime_kyc_documents" ADD CONSTRAINT "FK_04aa3a17bfeb63b7a0f6455d292" FOREIGN KEY ("user_id") REFERENCES "prime_trust_contacts"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
