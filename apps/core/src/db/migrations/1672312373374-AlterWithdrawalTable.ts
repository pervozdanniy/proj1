import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterWithdrawalTable1672312373374 implements MigrationInterface {
  name = 'AlterWithdrawalTable1672312373374';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "withdrawals" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(`ALTER TABLE "withdrawals" DROP CONSTRAINT "PK_0bd35ddb3acfb323ae3e024d2f8"`);
    await queryRunner.query(
      `ALTER TABLE "withdrawals" ADD CONSTRAINT "PK_507cbb00839ec7edc1100d72730" PRIMARY KEY ("user_id", "id")`,
    );
    await queryRunner.query(`ALTER TABLE "withdrawals" DROP CONSTRAINT "PK_507cbb00839ec7edc1100d72730"`);
    await queryRunner.query(
      `ALTER TABLE "withdrawals" ADD CONSTRAINT "PK_9871ec481baa7755f8bd8b7c7e9" PRIMARY KEY ("id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "withdrawals" DROP CONSTRAINT "PK_9871ec481baa7755f8bd8b7c7e9"`);
    await queryRunner.query(
      `ALTER TABLE "withdrawals" ADD CONSTRAINT "PK_507cbb00839ec7edc1100d72730" PRIMARY KEY ("user_id", "id")`,
    );
    await queryRunner.query(`ALTER TABLE "withdrawals" DROP CONSTRAINT "PK_507cbb00839ec7edc1100d72730"`);
    await queryRunner.query(
      `ALTER TABLE "withdrawals" ADD CONSTRAINT "PK_0bd35ddb3acfb323ae3e024d2f8" PRIMARY KEY ("user_id")`,
    );
    await queryRunner.query(`ALTER TABLE "withdrawals" DROP COLUMN "id"`);
  }
}
