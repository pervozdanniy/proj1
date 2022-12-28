import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterKycTable1671874610946 implements MigrationInterface {
  name = 'AlterKycTable1671874610946';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prime_kyc_documents" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(`ALTER TABLE "prime_kyc_documents" DROP CONSTRAINT "PK_04aa3a17bfeb63b7a0f6455d292"`);
    await queryRunner.query(
      `ALTER TABLE "prime_kyc_documents" ADD CONSTRAINT "PK_d258a7bf3b5394499467d74c3b5" PRIMARY KEY ("user_id", "id")`,
    );
    await queryRunner.query(`ALTER TABLE "prime_kyc_documents" DROP CONSTRAINT "FK_04aa3a17bfeb63b7a0f6455d292"`);
    await queryRunner.query(`ALTER TABLE "prime_kyc_documents" DROP CONSTRAINT "PK_d258a7bf3b5394499467d74c3b5"`);
    await queryRunner.query(
      `ALTER TABLE "prime_kyc_documents" ADD CONSTRAINT "PK_a10896dd11e26e98a565d466c9e" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "prime_trust_contacts" DROP CONSTRAINT "FK_867bca32ae1a76214ce3d41d720"`);
    await queryRunner.query(
      `ALTER TABLE "prime_trust_contacts" ADD CONSTRAINT "UQ_867bca32ae1a76214ce3d41d720" UNIQUE ("user_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "prime_kyc_documents" ADD CONSTRAINT "FK_04aa3a17bfeb63b7a0f6455d292" FOREIGN KEY ("user_id") REFERENCES "prime_trust_contacts"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "prime_trust_contacts" ADD CONSTRAINT "FK_867bca32ae1a76214ce3d41d720" FOREIGN KEY ("user_id") REFERENCES "prime_trust_accounts"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prime_trust_contacts" DROP CONSTRAINT "FK_867bca32ae1a76214ce3d41d720"`);
    await queryRunner.query(`ALTER TABLE "prime_kyc_documents" DROP CONSTRAINT "FK_04aa3a17bfeb63b7a0f6455d292"`);
    await queryRunner.query(`ALTER TABLE "prime_trust_contacts" DROP CONSTRAINT "UQ_867bca32ae1a76214ce3d41d720"`);
    await queryRunner.query(
      `ALTER TABLE "prime_trust_contacts" ADD CONSTRAINT "FK_867bca32ae1a76214ce3d41d720" FOREIGN KEY ("user_id") REFERENCES "prime_trust_accounts"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "prime_kyc_documents" DROP CONSTRAINT "PK_a10896dd11e26e98a565d466c9e"`);
    await queryRunner.query(
      `ALTER TABLE "prime_kyc_documents" ADD CONSTRAINT "PK_d258a7bf3b5394499467d74c3b5" PRIMARY KEY ("user_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "prime_kyc_documents" ADD CONSTRAINT "FK_04aa3a17bfeb63b7a0f6455d292" FOREIGN KEY ("user_id") REFERENCES "prime_trust_contacts"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "prime_kyc_documents" DROP CONSTRAINT "PK_d258a7bf3b5394499467d74c3b5"`);
    await queryRunner.query(
      `ALTER TABLE "prime_kyc_documents" ADD CONSTRAINT "PK_04aa3a17bfeb63b7a0f6455d292" PRIMARY KEY ("user_id")`,
    );
    await queryRunner.query(`ALTER TABLE "prime_kyc_documents" DROP COLUMN "id"`);
  }
}
