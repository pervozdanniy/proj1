import { Repository } from 'typeorm';
import { UserDetailsEntity } from '~svc/core/src/user/entities/user-details.entity';

let nextId = 1;

export const userDetailStorage: UserDetailsEntity[] = [];

const repository: Partial<Repository<UserDetailsEntity>> = {
  create: jest.fn().mockImplementation((data) => data),
  //   findOneBy: jest
  //     .fn()
  //     .mockImplementation(async (req: Record<keyof UserEntity, UserEntity[keyof UserEntity]>) =>
  //       userStorage.find((user) => user.email === req.email),
  //     ),
  save: jest.fn().mockImplementation(async (entity: UserDetailsEntity) => {
    entity.updated_at = new Date();
    if (entity.id) {
      const index = userDetailStorage.findIndex((user) => user.id === entity.id);
      if (index > -1) {
        userDetailStorage.splice(index, 1, entity);
      }
    } else {
      entity.id = nextId++;
      entity.created_at = entity.created_at ?? new Date();
      userDetailStorage.push(entity);
    }

    return entity;
  }),
};

export default repository;
