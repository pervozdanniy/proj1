import { Repository } from 'typeorm';
import { CountryEntity } from '~svc/core/src/api/country/entities/country.entity';
import { makeFindOneBy } from '../utils/repository.helpers';
import { MockType } from '../utils/types';

export const countryStorage: CountryEntity[] = [{ id: 1, code: 'US', name: 'us', payment_gateway_id: 1 }];

const findOneBy = makeFindOneBy(countryStorage);

const repositoryMockFactory: () => MockType<Repository<CountryEntity>> = jest.fn(() => ({
  create: jest.fn().mockImplementation((data) => data),

  findOneBy: jest.fn(async (req) => findOneBy(req)),

  save: jest.fn().mockImplementation(async (entity: CountryEntity) => {
    const index = countryStorage.findIndex((details) => details.id === entity.id);
    if (index > -1) {
      countryStorage.splice(index, 1, entity);
    } else {
      countryStorage.push(entity);
    }

    return entity;
  }),
}));

export default repositoryMockFactory;
