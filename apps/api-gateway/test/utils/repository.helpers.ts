import { FindOptionsWhere } from 'typeorm';

export const makeFindOneBy =
  <T>(storage: T[]) =>
  (req: FindOptionsWhere<T>): T | undefined => {
    return storage.find((entity) =>
      Object.keys(req).reduce((cond, field) => cond && entity[field] === req[field], true),
    );
  };
