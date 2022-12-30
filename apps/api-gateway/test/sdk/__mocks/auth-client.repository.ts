import { EntityNotFoundError, Repository } from 'typeorm';
import { AuthClient } from '~svc/auth/src/entities/auth_client.entity';
import { MockType } from '../../utils/types';

let nextId = 1;

type Entity = Partial<AuthClient>;

export const authClientStorage: Entity[] = [];

const find = (req: Record<keyof Entity, Entity[keyof Entity]>): Entity | undefined => {
  return authClientStorage.find((entity) =>
    Object.keys(req).reduce((cond, field) => cond && entity[field] === req[field], true),
  );
};

export const repositoryMockFactory = jest.fn(
  (): MockType<Repository<Entity>> => ({
    create: jest.fn((data) => data),
    findOneBy: jest.fn(async (req: Record<keyof Entity, Entity[keyof Entity]>) => find(req)),
    findOneByOrFail: jest.fn().mockImplementation(async (req: Record<keyof Entity, Entity[keyof Entity]>) => {
      const entity = find(req);
      if (!entity) throw new EntityNotFoundError(AuthClient, req);

      return entity;
    }),
    delete: jest.fn((id) => {
      const index = authClientStorage.findIndex((user) => user.id === id);
      if (index > -1) {
        authClientStorage.splice(index, 1);

        return { affected: 1 };
      }

      return { affected: 0 };
    }),
    save: jest.fn().mockImplementation(async (entity: Entity) => {
      if (entity.id) {
        const index = authClientStorage.findIndex((user) => user.id === entity.id);
        if (index > -1) {
          authClientStorage.splice(index, 1, entity);
        }
      } else {
        entity.id = nextId++;
        authClientStorage.push(entity);
      }

      return entity;
    }),
  }),
);

export default repositoryMockFactory;
