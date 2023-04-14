import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropUnnecessaryTables1681477268254 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE contributions CASCADE;');
    await queryRunner.query('DROP TABLE withdrawals CASCADE;');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log(queryRunner);
  }
}
