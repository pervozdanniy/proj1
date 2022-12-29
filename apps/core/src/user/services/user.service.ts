import { Status } from '@grpc/grpc-js/build/src/constants';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { CountryEntity } from '~svc/core/src/country/entities/country.entity';
import { CreateRequestDto } from '../dto/create-request.dto';
import { UserDetailsEntity } from '../entities/user-details.entity';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    @InjectRepository(CountryEntity)
    private countryEntityRepository: Repository<CountryEntity>,

    @InjectRepository(UserDetailsEntity)
    private userDetailsRepository: Repository<UserDetailsEntity>,
  ) {}

  async get(id: number): Promise<UserEntity> {
    return this.userRepository.findOneByOrFail({ id });
  }

  async create({ details, ...userData }: CreateRequestDto): Promise<UserEntity> {
    const { country_id } = userData;
    const country = await this.countryEntityRepository.findOneBy({ id: country_id });
    if (!country) {
      throw new GrpcException(Status.NOT_FOUND, 'Country not found!', 400);
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
      .leftJoinAndSelect('u.country', 'c')
      .leftJoinAndSelect('c.payment_gateway', 'p')
      .leftJoinAndSelect('u.details', 'd')
      .leftJoinAndSelect('u.prime_user', 'pu')
      .where('u.id = :id', { id })
      .getOne();

    return userDetails;
  }

  async findByLogin(login: string) {
    return this.userRepository.findOneBy({ email: login });
  }

  async delete(id: number) {
    const { affected } = await this.userRepository.delete(id);

    return affected === 1;
  }
}
