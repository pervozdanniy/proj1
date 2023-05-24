import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { RawSqlResultsToEntityTransformer } from 'typeorm/query-builder/transformer/RawSqlResultsToEntityTransformer';
import './driver/postgres/cursor';

declare module 'typeorm' {
  class SelectQueryBuilder<Entity extends ObjectLiteral> {
    getRawIterator<T>(batchSize?: number): AsyncGenerator<T, void>;
    getIterator(batchSize?: number): AsyncGenerator<Entity, void>;
  }
}

SelectQueryBuilder.prototype.getRawIterator = async function* <T>(
  this: SelectQueryBuilder<any>,
  batchSize = 1000,
): AsyncGenerator<T, void> {
  const queryRunner = this.obtainQueryRunner();
  const [sql, parameters] = this.getQueryAndParameters();
  const [cursor, release] = await queryRunner.cursor<T>(sql, parameters);

  let hasMore = false;
  try {
    do {
      const rows = await cursor.read(batchSize);
      for (const row of rows) {
        yield row;
      }
      hasMore = rows.length > 0;
    } while (hasMore);
  } finally {
    release();
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

  const queryRunner = this.obtainQueryRunner();
  const [sql, parameters] = this.getQueryAndParameters();
  const [cursor, release] = await queryRunner.cursor(sql, parameters);

  let hasMore = false;
  try {
    do {
      const rows = await cursor.read(batchSize);
      for (const row of transformer.transform(rows, this.expressionMap.mainAlias)) {
        yield row;
      }
      hasMore = rows.length > 0;
    } while (hasMore);
  } finally {
    release();
  }
};
