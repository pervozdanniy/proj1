import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeStructure1674501002818 implements MigrationInterface {
  name = 'ChangeStructure1674501002818';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prime_trust_contacts" DROP CONSTRAINT "FK_867bca32ae1a76214ce3d41d720"`);
    await queryRunner.query(`ALTER TABLE "prime_trust_accounts" DROP CONSTRAINT "FK_6343b28bf90b16dd4e0d1dee67e"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_abb56b47aedf8bf738ac23b6c1"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_240ad7d5909ae3c0da6ed63389"`);
    await queryRunner.query(`ALTER TABLE "user_contact" DROP CONSTRAINT "PK_5e2db38fe9984ce8a83efcf6fe3"`);
    await queryRunner.query(
      `ALTER TABLE "user_contact" ADD CONSTRAINT "PK_abb56b47aedf8bf738ac23b6c15" PRIMARY KEY ("user_id")`,
    );
    await queryRunner.query(`ALTER TABLE "user_contact" DROP COLUMN "phone"`);
    await queryRunner.query(`ALTER TABLE "user_contact" ADD "phone" character varying(20) NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user_contact" DROP CONSTRAINT "PK_abb56b47aedf8bf738ac23b6c15"`);
    await queryRunner.query(
      `ALTER TABLE "user_contact" ADD CONSTRAINT "PK_5e2db38fe9984ce8a83efcf6fe3" PRIMARY KEY ("user_id", "phone")`,
    );
    await queryRunner.query(`ALTER TABLE "prime_trust_contacts" ADD "account_id" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "prime_trust_balance" DROP CONSTRAINT "FK_764c5658b6d4cb0234d4d8c69b2"`);
    await queryRunner.query(`ALTER TABLE "prime_trust_accounts" DROP CONSTRAINT "UQ_6343b28bf90b16dd4e0d1dee67e"`);
    await queryRunner.query(`ALTER TABLE "user_contact" ALTER COLUMN "contact_id" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user_contact" DROP CONSTRAINT "PK_5e2db38fe9984ce8a83efcf6fe3"`);
    await queryRunner.query(
      `ALTER TABLE "user_contact" ADD CONSTRAINT "PK_85bc4bc95fb157eb965375ed763" PRIMARY KEY ("user_id", "phone", "contact_id")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_abb56b47aedf8bf738ac23b6c1" ON "user_contact" ("user_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_240ad7d5909ae3c0da6ed63389" ON "user_contact" ("contact_id") `);
    await queryRunner.query(
      `ALTER TABLE "user_contact" ADD CONSTRAINT "FK_abb56b47aedf8bf738ac23b6c15" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_contact" ADD CONSTRAINT "FK_240ad7d5909ae3c0da6ed633899" FOREIGN KEY ("contact_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "prime_trust_contacts" ADD CONSTRAINT "FK_867bca32ae1a76214ce3d41d720" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "prime_trust_contacts" ADD CONSTRAINT "FK_b05854ef9357e5efd7fef5094b4" FOREIGN KEY ("account_id") REFERENCES "prime_trust_accounts"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "prime_trust_balance" ADD CONSTRAINT "FK_764c5658b6d4cb0234d4d8c69b2" FOREIGN KEY ("user_id") REFERENCES "prime_trust_accounts"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prime_trust_balance" DROP CONSTRAINT "FK_764c5658b6d4cb0234d4d8c69b2"`);
    await queryRunner.query(`ALTER TABLE "prime_trust_contacts" DROP CONSTRAINT "FK_b05854ef9357e5efd7fef5094b4"`);
    await queryRunner.query(`ALTER TABLE "prime_trust_contacts" DROP CONSTRAINT "FK_867bca32ae1a76214ce3d41d720"`);
    await queryRunner.query(`ALTER TABLE "user_contact" DROP CONSTRAINT "FK_240ad7d5909ae3c0da6ed633899"`);
    await queryRunner.query(`ALTER TABLE "user_contact" DROP CONSTRAINT "FK_abb56b47aedf8bf738ac23b6c15"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_240ad7d5909ae3c0da6ed63389"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_abb56b47aedf8bf738ac23b6c1"`);
    await queryRunner.query(`ALTER TABLE "user_contact" DROP CONSTRAINT "PK_85bc4bc95fb157eb965375ed763"`);
    await queryRunner.query(
      `ALTER TABLE "user_contact" ADD CONSTRAINT "PK_5e2db38fe9984ce8a83efcf6fe3" PRIMARY KEY ("user_id", "phone")`,
    );
    await queryRunner.query(`ALTER TABLE "user_contact" ALTER COLUMN "contact_id" DROP NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "prime_trust_accounts" ADD CONSTRAINT "UQ_6343b28bf90b16dd4e0d1dee67e" UNIQUE ("user_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "prime_trust_balance" ADD CONSTRAINT "FK_764c5658b6d4cb0234d4d8c69b2" FOREIGN KEY ("user_id") REFERENCES "prime_trust_accounts"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "prime_trust_contacts" DROP COLUMN "account_id"`);
    await queryRunner.query(`ALTER TABLE "user_contact" DROP CONSTRAINT "PK_5e2db38fe9984ce8a83efcf6fe3"`);
    await queryRunner.query(
      `ALTER TABLE "user_contact" ADD CONSTRAINT "PK_abb56b47aedf8bf738ac23b6c15" PRIMARY KEY ("user_id")`,
    );
    await queryRunner.query(`ALTER TABLE "user_contact" DROP COLUMN "phone"`);
    await queryRunner.query(`ALTER TABLE "user_contact" ADD "phone" character varying(20) NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user_contact" DROP CONSTRAINT "PK_abb56b47aedf8bf738ac23b6c15"`);
    await queryRunner.query(
      `ALTER TABLE "user_contact" ADD CONSTRAINT "PK_5e2db38fe9984ce8a83efcf6fe3" PRIMARY KEY ("user_id", "phone")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_240ad7d5909ae3c0da6ed63389" ON "user_contact" ("contact_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_abb56b47aedf8bf738ac23b6c1" ON "user_contact" ("user_id") `);
    await queryRunner.query(
      `ALTER TABLE "prime_trust_accounts" ADD CONSTRAINT "FK_6343b28bf90b16dd4e0d1dee67e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "prime_trust_contacts" ADD CONSTRAINT "FK_867bca32ae1a76214ce3d41d720" FOREIGN KEY ("user_id") REFERENCES "prime_trust_accounts"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
