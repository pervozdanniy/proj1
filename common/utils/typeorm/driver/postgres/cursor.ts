import type { PoolClient } from 'pg';
import Cursor from 'pg-cursor';
import { QueryRunner } from 'typeorm';
import { PostgresQueryRunner } from 'typeorm/driver/postgres/PostgresQueryRunner';

declare module 'typeorm' {
  interface QueryRunner {
    cursor<T>(query: string, parameters?: any[]): Promise<[Cursor<T>, () => void]>;
  }
}

declare module 'typeorm/driver/postgres/PostgresQueryRunner' {
  interface PostgresQueryRunner {
    cursor<T>(query: string, parameters?: any[]): Promise<[Cursor<T>, () => void]>;
  }
}

PostgresQueryRunner.prototype.cursor = async function <T>(this: QueryRunner, query: string, parameters?: any[]) {
  const connection: PoolClient = await this.connect();
  const cursor = connection.query(new Cursor<T>(query, parameters));
  const release = () => cursor.close(() => this.release().catch(() => {}));

  return [cursor, release];
};
