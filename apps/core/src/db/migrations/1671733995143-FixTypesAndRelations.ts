import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixTypesAndRelations1671733995143 implements MigrationInterface {
  name = 'FixTypesAndRelations1671733995143';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prime_trust_users" DROP CONSTRAINT "prime_trust_users_user_id_fkey"`);
    await queryRunner.query(`ALTER TABLE "user_details" DROP CONSTRAINT "user_details_user_id_fkey"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "fk_countries_customers"`);
    await queryRunner.query(`ALTER TABLE "countries" DROP CONSTRAINT "countries_payment_gateway_id_fkey"`);
    await queryRunner.query(`ALTER TABLE "prime_trust_accounts" DROP CONSTRAINT "prime_trust_accounts_user_id_fkey"`);
    await queryRunner.query(`DROP INDEX "public"."idx_users_email"`);
    await queryRunner.query(`ALTER TABLE "prime_trust_users" DROP CONSTRAINT "prime_trust_users_pkey"`);
    await queryRunner.query(`ALTER TABLE "prime_trust_users" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "user_details" DROP CONSTRAINT "user_details_pkey"`);
    await queryRunner.query(`ALTER TABLE "user_details" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "prime_trust_accounts" DROP CONSTRAINT "prime_trust_accounts_pkey"`);
    await queryRunner.query(`ALTER TABLE "prime_trust_accounts" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "prime_trust_users" ADD CONSTRAINT "PK_bc82792e39d720d4bd34c4cfd96" PRIMARY KEY ("user_id")`,
    );
    await queryRunner.query(`ALTER TABLE "prime_trust_users" ALTER COLUMN "created_at" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "prime_trust_users" ALTER COLUMN "updated_at" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "prime_trust_users" ALTER COLUMN "updated_at" SET DEFAULT now()`);
    await queryRunner.query(
      `ALTER TABLE "user_details" ADD CONSTRAINT "PK_ef1a1915f99bcf7a87049f74494" PRIMARY KEY ("user_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_details" ADD CONSTRAINT "UQ_ef1a1915f99bcf7a87049f74494" UNIQUE ("user_id")`,
    );
    await queryRunner.query(`ALTER TABLE "user_details" ALTER COLUMN "created_at" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user_details" ALTER COLUMN "updated_at" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user_details" ALTER COLUMN "updated_at" SET DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`);
    await queryRunner.query(`ALTER TABLE "prime_trust_accounts" ALTER COLUMN "user_id" SET NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "prime_trust_accounts" ADD CONSTRAINT "PK_6343b28bf90b16dd4e0d1dee67e" PRIMARY KEY ("user_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "prime_trust_users" ADD CONSTRAINT "FK_bc82792e39d720d4bd34c4cfd96" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_details" ADD CONSTRAINT "FK_ef1a1915f99bcf7a87049f74494" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "countries" ADD CONSTRAINT "FK_b3e2b90c6f1b1f5da0740711f7f" FOREIGN KEY ("payment_gateway_id") REFERENCES "payment_gateways"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "prime_trust_accounts" ADD CONSTRAINT "FK_6343b28bf90b16dd4e0d1dee67e" FOREIGN KEY ("user_id") REFERENCES "prime_trust_users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prime_trust_accounts" DROP CONSTRAINT "FK_6343b28bf90b16dd4e0d1dee67e"`);
    await queryRunner.query(`ALTER TABLE "countries" DROP CONSTRAINT "FK_b3e2b90c6f1b1f5da0740711f7f"`);
    await queryRunner.query(`ALTER TABLE "user_details" DROP CONSTRAINT "FK_ef1a1915f99bcf7a87049f74494"`);
    await queryRunner.query(`ALTER TABLE "prime_trust_users" DROP CONSTRAINT "FK_bc82792e39d720d4bd34c4cfd96"`);
    await queryRunner.query(`ALTER TABLE "prime_trust_accounts" DROP CONSTRAINT "PK_6343b28bf90b16dd4e0d1dee67e"`);
    await queryRunner.query(`ALTER TABLE "prime_trust_accounts" ALTER COLUMN "user_id" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`);
    await queryRunner.query(`ALTER TABLE "user_details" ALTER COLUMN "updated_at" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "user_details" ALTER COLUMN "updated_at" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user_details" ALTER COLUMN "created_at" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user_details" DROP CONSTRAINT "UQ_ef1a1915f99bcf7a87049f74494"`);
    await queryRunner.query(`ALTER TABLE "user_details" DROP CONSTRAINT "PK_ef1a1915f99bcf7a87049f74494"`);
    await queryRunner.query(`ALTER TABLE "prime_trust_users" ALTER COLUMN "updated_at" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "prime_trust_users" ALTER COLUMN "updated_at" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "prime_trust_users" ALTER COLUMN "created_at" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "prime_trust_users" DROP CONSTRAINT "PK_bc82792e39d720d4bd34c4cfd96"`);
    await queryRunner.query(`ALTER TABLE "prime_trust_accounts" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "prime_trust_accounts" ADD CONSTRAINT "prime_trust_accounts_pkey" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "user_details" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user_details" ADD CONSTRAINT "user_details_pkey" PRIMARY KEY ("id")`);
    await queryRunner.query(`ALTER TABLE "prime_trust_users" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "prime_trust_users" ADD CONSTRAINT "prime_trust_users_pkey" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_users_email" ON "users" ("email") `);
    await queryRunner.query(
      `ALTER TABLE "prime_trust_accounts" ADD CONSTRAINT "prime_trust_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "prime_trust_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "countries" ADD CONSTRAINT "countries_payment_gateway_id_fkey" FOREIGN KEY ("payment_gateway_id") REFERENCES "payment_gateways"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "fk_countries_customers" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_details" ADD CONSTRAINT "user_details_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "prime_trust_users" ADD CONSTRAINT "prime_trust_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
