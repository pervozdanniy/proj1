import { Repository } from 'typeorm';
import { MockType } from '~common/test/utils/types';
import { RefreshTokenEntity } from '~svc/auth/src/entities/refresh-token.entity';

export const tokenStorage: RefreshTokenEntity[] = [];
let nextId = 0;

const repositoryMockFactory: () => MockType<Repository<RefreshTokenEntity>> = jest.fn(() => ({
  insert: jest.fn((data: Partial<RefreshTokenEntity>) => {
    const id = ++nextId;
    tokenStorage.push({ ...data, id } as any);

    return { identifiers: [{ id }] };
  }),
  delete: jest.fn((cond: number | { family: string }) => {
    let index;
    if (typeof cond === 'number') {
      index = tokenStorage.findIndex((entity) => entity.id === cond);
    } else {
      index = tokenStorage.findIndex((entity) => entity.family === cond.family);
    }
    const deleted = tokenStorage.splice(index, 1);

    return { affected: deleted.length };
  }),
}));

export default repositoryMockFactory;
