import { UserCheckService } from '@/user/services/user-check.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import { ContactsResponse, SearchContactRequest, VerifyRequest } from '~common/grpc/interfaces/core';
import { CountryService } from '../../country/country.service';
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
    private userCheckService: UserCheckService,
    private countryService: CountryService,
  ) {}

  get(id: number): Promise<UserEntity> {
    return this.userRepository.findOneOrFail({ where: { id }, relations: ['details', 'contacts'] });
  }

  async create({ details, ...userData }: Omit<CreateRequestDto, 'contacts'>): Promise<UserEntity> {
    const { country_code, source, phone, email } = userData;
    await this.userCheckService.checkUserData(phone, email);

    if (!source) {
      if (country_code === 'US' && details) {
        this.countryService.checkUSA(details);
      }
    }

    const user = await this.userRepository.save(this.userRepository.create(userData));
    if (details) {
      await this.userDetailsRepository.save(this.userDetailsRepository.create({ user_id: user.id, ...details }));
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

  async verifySocure(payload: VerifyRequest): Promise<SuccessResponse> {
    const { id, document_uuid, socure_verify } = payload;
    await this.userDetailsRepository.update({ user_id: id }, { socure_verify, document_uuid });

    return { success: true };
  }

  async getContacts(request: SearchContactRequest): Promise<ContactsResponse> {
    const { user_id, search_after, limit, search_term } = request;

    const queryBuilder = this.userRepository
      .createQueryBuilder('u')
      .leftJoin(UserDetailsEntity, 'd', 'd.user_id = u.id')
      .leftJoin(UserContactEntity, 'contactDetails', 'contactDetails.contact_id = u.id');

    if (search_after) {
      queryBuilder.where('contactDetails.contact_id < :search_after', { search_after });
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
            .orWhere('d.first_name ILIKE :search_term', {
              search_term: `${search_term}%`,
            })
            .orWhere('d.last_name ILIKE :search_term', {
              search_term: `${search_term}%`,
            });
        }),
      );
    }

    queryBuilder.andWhere('contactDetails.user_id = :user_id', { user_id });

    queryBuilder
      .select([
        'u.id as id',
        'u.email as email',
        'u.phone as phone',
        'd.first_name as first_name',
        'd.last_name as last_name',
      ])
      .orderBy('u.id', 'DESC');

    const contacts = await queryBuilder.limit(limit).getRawMany();

    if (contacts.length === 0) {
      return { contacts, has_more: false };
    }

    const { id: last_id } = contacts.at(-1);

    return {
      last_id,
      contacts,
      has_more: last_id > 1,
    };
  }
}
