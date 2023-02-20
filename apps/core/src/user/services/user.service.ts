import { CountryEntity } from '@/country/entities/country.entity';
import { CountryService } from '@/country/services/country.service';
import { UserCheckService } from '@/user/services/user-check.service';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { GrpcException } from '~common/utils/exceptions/grpc.exception';
import { FindRequestDto } from '../dto/find.request.dto';
import { CreateRequestDto, UpdateRequestDto } from '../dto/user-request.dto';
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
    private userCheckService: UserCheckService,
    private countryService: CountryService,
  ) {}

  get(id: number): Promise<UserEntity> {
    return this.userRepository.findOneOrFail({ where: { id }, relations: ['details', 'contacts'] });
  }

  async create({ details, ...userData }: Omit<CreateRequestDto, 'contacts'>): Promise<UserEntity> {
    const { country_id, source, phone, email } = userData;
    await this.userCheckService.checkUserData(phone, email);

    if (!source) {
      const country = await this.countryEntityRepository.findOneBy({ id: country_id });
      if (!country) {
        throw new GrpcException(Status.NOT_FOUND, 'Country not found!', 400);
      }
      if (country.code === 'US' && details) {
        this.countryService.checkUSA(details);
      }
    }
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
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
      .where('u.id = :id', { id })
      .getOne();

    return userDetails;
  }

  async findByLogin({ email, phone }: FindRequestDto) {
    if (email) {
      return this.userRepository.findOneBy({ email });
    }
    if (phone) {
      return this.userRepository.findOneBy({ phone });
    }

    return undefined;
  }

  async delete(id: number) {
    const { affected } = await this.userRepository.delete(id);

    return affected === 1;
  }

  async update(request: Omit<UpdateRequestDto, 'contacts'>) {
    const { details, id, ...payload } = request;
    if (payload.country_id) {
      const country = await this.countryEntityRepository.findOneBy({ id: payload.country_id });
      if (!country) {
        throw new GrpcException(Status.NOT_FOUND, 'Country not found!', 400);
      }

      if (country.code === 'US' && details) {
        this.countryService.checkUSA(details);
      }
    }

    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }
    await this.userRepository.update({ id }, payload);

    if (details) {
      const currentDetails = await this.userDetailsRepository.findOneBy({ user_id: id });
      if (currentDetails) {
        await this.userDetailsRepository.update({ user_id: id }, details);
      } else {
        await this.userDetailsRepository.save(this.userDetailsRepository.create({ user_id: id, ...details }));
      }
    }

    return this.userRepository.findOne({ where: { id }, relations: ['details'] });
  }

  async checkIfUnique({ email, phone }: { email: string; phone: string }) {
    const count = await this.userRepository.countBy([{ email }, { phone }]);

    return count === 0;
  }
}
