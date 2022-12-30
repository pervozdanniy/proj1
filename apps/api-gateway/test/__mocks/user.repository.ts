import { EntityNotFoundError, Repository } from 'typeorm';
import { UserEntity } from '~svc/core/src/user/entities/user.entity';
import { MockType } from '../utils/types';

let nextId = 1;

type User = Partial<UserEntity>;

export const userStorage: User[] = [];

const repositoryMockFactory: () => MockType<Repository<User>> = jest.fn(() => ({
  create: jest.fn().mockImplementation((data) => data),
  findOneBy: jest
    .fn()
    .mockImplementation(async (req: Record<keyof User, User[keyof User]>) =>
      userStorage.find((user) => user.email === req.email),
    ),
  findOneByOrFail: jest.fn().mockImplementation(async (req: Record<keyof User, User[keyof User]>) => {
    const user = userStorage.find((user) => user.id === req.id);
    if (!user) throw new EntityNotFoundError(UserEntity, req);

    return user;
  }),
  delete: jest.fn().mockImplementation((id) => {
    const index = userStorage.findIndex((user) => user.id === id);
    if (index > -1) {
      userStorage.splice(index, 1);

      return { affected: 1 };
    }

    return { affected: 0 };
  }),
  save: jest.fn().mockImplementation(async (entity: User) => {
    entity.updated_at = new Date();
    if (entity.id) {
      const index = userStorage.findIndex((user) => user.id === entity.id);
      if (index > -1) {
        userStorage.splice(index, 1, entity);
      }
    } else {
      entity.id = nextId++;
      entity.created_at = entity.created_at ?? new Date();
      userStorage.push(entity);
    }

    return entity;
  }),
}));

export default repositoryMockFactory;
