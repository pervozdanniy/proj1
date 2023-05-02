import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Contact, ContactsResponse, SearchContactRequest } from '~common/grpc/interfaces/core';
import { CountryService } from '../../country/country.service';
import { FindBySocialIdDto } from '../dto/find-by-social-id.dto';
import { FindRequestDto } from '../dto/find.request.dto';
import { CreateRequestDto, UpdateRequestDto } from '../dto/user-request.dto';
import { UserContactEntity } from '../entities/user-contact.entity';
import { UserDetailsEntity } from '../entities/user-details.entity';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(UserDetailsEntity)
    private userDetailsRepository: Repository<UserDetailsEntity>,
    private countryService: CountryService,
  ) {}

  get(id: number): Promise<UserEntity> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.documents', 'documents')
      .leftJoinAndSelect('user.details', 'details')
      .leftJoinAndSelect('user.contacts', 'contacts')
      .where('user.id = :id', { id })
      .getOne();
  }

  async create({ details, ...userData }: Omit<CreateRequestDto, 'contacts'>): Promise<UserEntity> {
    const { country_code, source } = userData;

    if (!source) {
      if (country_code === 'US' && details) {
        this.countryService.checkUSA(details);
      }
    }

    const user = await this.userRepository.save(this.userRepository.create(userData));
    if (details) {
      user.details = await this.userDetailsRepository.save(
        this.userDetailsRepository.create({ user_id: user.id, ...details }),
      );
    }

    return user;
  }

  async getUserInfo(id: number) {
    const userDetails = await this.userRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.details', 'd')
      .where('u.id = :id', { id })
      .getOne();

    return userDetails;
  }

  findByLogin({ email, phone }: FindRequestDto) {
    return this.userRepository.findOneBy({ email, phone });
  }

  findBySocialId({ social_id }: FindBySocialIdDto) {
    return this.userRepository.findOneBy({ social_id });
  }

  async delete(id: number) {
    const { affected } = await this.userRepository.delete(id);

    return affected === 1;
  }

  async update(request: Omit<UpdateRequestDto, 'contacts'>) {
    const { details, id, ...payload } = request;
    if (payload.country_code) {
      if (payload.country_code === 'US' && details) {
        this.countryService.checkUSA(details);
      }
    }

    await this.userRepository.update({ id }, payload);

    if (details) {
      const currentDetails = await this.userDetailsRepository.findOneBy({ user_id: id });
      if (currentDetails) {
        await this.userDetailsRepository.update({ user_id: id }, details);
      } else {
        await this.userDetailsRepository.insert(this.userDetailsRepository.create({ user_id: id, ...details }));
      }
    }

    return this.userRepository.findOne({ where: { id }, relations: ['details'] });
  }

  async checkIfUnique({ email, phone }: { email: string; phone: string }) {
    const count = await this.userRepository.countBy([{ email }, { phone }]);

    return count === 0;
  }

  async getContacts(request: SearchContactRequest): Promise<ContactsResponse> {
    const { user_id, search_after, limit, search_term } = request;

    const queryBuilder = this.userRepository
      .createQueryBuilder('u')
      .leftJoin(UserDetailsEntity, 'ud', 'ud.user_id = u.id')
      .innerJoin(UserContactEntity, 'contactDetails', 'contactDetails.contact_id = u.id');

    if (search_after) {
      queryBuilder.where('contactDetails.contact_id > :search_after', { search_after });
    }

    if (search_term) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('u.email ILIKE :search_term', {
            search_term: `${search_term}%`,
          })
            .orWhere('u.phone ILIKE :search_term', {
              search_term: `${search_term}%`,
            })
            .orWhere('ud.first_name ILIKE :search_term', {
              search_term: `${search_term}%`,
            })
            .orWhere('ud.last_name ILIKE :search_term', {
              search_term: `${search_term}%`,
            });
        }),
      );
    }

    queryBuilder
      .andWhere('contactDetails.user_id = :user_id', { user_id })
      .andWhere('contactDetails.contact_id != :user_id', { user_id });

    queryBuilder.select([
      'u.id as id',
      'u.email as email',
      'u.phone as phone',
      'ud.first_name as first_name',
      'ud.last_name as last_name',
      'ud.avatar as avatar',
    ]);

    let has_more = false;
    let last_id = 0;

    const contacts = await queryBuilder.limit(limit + 1).getRawMany();

    if (contacts.length > limit) {
      has_more = true;
      contacts.splice(-1);
      const { id } = contacts.at(-1);
      last_id = id;
    }

    return {
      last_id,
      contacts,
      has_more,
    };
  }

  getLatestRecepients(request: { user_id: number; limit: number }): Promise<Contact[]> {
    return this.userRepository
      .createQueryBuilder('u')
      .select([
        'u.id as id',
        'u.email as email',
        'u.phone as phone',
        'ud.first_name as first_name',
        'ud.last_name as last_name',
        'ud.avatar as avatar',
      ])
      .innerJoin('transfers', 't', 'u.id = t.receiver_id')
      .leftJoinAndSelect(UserDetailsEntity, 'ud', 'u.id = ud.user_id')
      .where('t.user_id = :userId', { userId: request.user_id })
      .andWhere(`t.updated_at >= (NOW() - interval '1 year')`)
      .limit(request.limit)
      .getRawMany();
  }
}
