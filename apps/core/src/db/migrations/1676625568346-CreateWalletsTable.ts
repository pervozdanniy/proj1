import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateWalletsTable1676625568346 implements MigrationInterface {
    name = 'CreateWalletsTable1676625568346'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."wallets_wallet_for_enum" AS ENUM('deposit', 'withdrawal')`);
        await queryRunner.query(`CREATE TABLE "wallets" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "label" character varying, "asset_transfer_method_id" character varying, "wallet_address" character varying, "wallet_for" "public"."wallets_wallet_for_enum" NOT NULL DEFAULT 'deposit', "asset_id" character varying, "asset_type" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8402e5df5a30a229380e83e4f7e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "withdrawal_params" ADD "wallet_id" integer`);
        await queryRunner.query(`ALTER TABLE "deposit_params" ADD "wallet_id" integer`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD CONSTRAINT "FK_92558c08091598f7a4439586cda" FOREIGN KEY ("user_id") REFERENCES "prime_trust_contacts"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallets" DROP CONSTRAINT "FK_92558c08091598f7a4439586cda"`);
        await queryRunner.query(`ALTER TABLE "deposit_params" DROP COLUMN "wallet_id"`);
        await queryRunner.query(`ALTER TABLE "withdrawal_params" DROP COLUMN "wallet_id"`);
        await queryRunner.query(`DROP TABLE "wallets"`);
        await queryRunner.query(`DROP TYPE "public"."wallets_wallet_for_enum"`);
    }

}
