import type { PoolClient } from 'pg';
import Cursor from 'pg-cursor';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { RawSqlResultsToEntityTransformer } from 'typeorm/query-builder/transformer/RawSqlResultsToEntityTransformer';

declare module 'typeorm' {
  class SelectQueryBuilder<Entity extends ObjectLiteral> {
    cursor<T>(): Promise<[Cursor<T>, () => void]>;
    getRawIterator<T>(batchSize?: number): AsyncGenerator<T, void>;
    getIterator(batchSize?: number): AsyncGenerator<Entity, void>;
  }
}

SelectQueryBuilder.prototype.cursor = async function <T>(this: SelectQueryBuilder<any>) {
  const [sql, parameters] = this.getQueryAndParameters();
  const queryRunner = this.obtainQueryRunner();
  const connection: PoolClient = await queryRunner.connect();
  const cursor = connection.query(new Cursor<T>(sql, parameters));
  const done = () => cursor.close(() => queryRunner.release().catch(() => {}));

  return [cursor, done];
};

SelectQueryBuilder.prototype.getRawIterator = async function* <T>(
  this: SelectQueryBuilder<any>,
  batchSize = 1000,
): AsyncGenerator<T, void> {
  const [cursor, done] = await this.cursor<T>();

  let hasMore = false;
  try {
    do {
      const rows = await cursor.read(batchSize);
      hasMore = rows.length > 0;
      for (const row of rows) {
        yield row;
      }
    } while (hasMore);
  } finally {
    done();
  }
};

SelectQueryBuilder.prototype.getIterator = async function* <Entity>(
  this: SelectQueryBuilder<Entity>,
  batchSize = 1000,
): AsyncGenerator<Entity, void> {
  const transformer = new RawSqlResultsToEntityTransformer(
    this.expressionMap,
    this.connection.driver,
    [],
    [],
    this.queryRunner,
  );

  const [cursor, done] = await this.cursor();
  let hasMore = false;
  try {
    do {
      const rows = await cursor.read(batchSize);
      hasMore = rows.length > 0;
      for (const row of transformer.transform(rows, this.expressionMap.mainAlias)) {
        yield row;
      }
    } while (hasMore);
  } finally {
    done();
  }
};
