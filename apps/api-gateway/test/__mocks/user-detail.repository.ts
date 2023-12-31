import { Repository } from 'typeorm';
import { MockType } from '~common/test/utils/types';
import { UserDetailsEntity } from '~svc/core/src/user/entities/user-details.entity';

export const userDetailStorage: UserDetailsEntity[] = [];

const repositoryMockFactory: () => MockType<Repository<UserDetailsEntity>> = jest.fn(() => ({
  create: jest.fn().mockImplementation((data) => data),

  save: jest.fn().mockImplementation(async (entity: UserDetailsEntity) => {
    entity.updated_at = new Date();
    const index = userDetailStorage.findIndex((details) => details.user_id === entity.user_id);
    if (index > -1) {
      userDetailStorage.splice(index, 1, entity);
    } else {
      entity.created_at = entity.created_at ?? new Date();
      userDetailStorage.push(entity);
    }

    return entity;
  }),
}));

export default repositoryMockFactory;
