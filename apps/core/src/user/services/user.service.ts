import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
<<<<<<< HEAD
import { UserDetailsEntity } from '~svc/core/src/user/entities/user-details.entity';
import { CreateRequestDto } from '../dto/create-request.dto';
=======
import { AwsKmsService } from '~svc/core/src/aws/services/aws.kms.service';
import { AwsSqsProducerService } from '~svc/core/src/aws/services/aws.sqs.producer.service';
import { CreateRequestDto } from '../dto/create.request.dto';
>>>>>>> 492ba48 (SKOPA-99: added integration tests)
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    @InjectRepository(UserDetailsEntity)
    private userDetailsRepository: Repository<UserDetailsEntity>,
  ) {}

  async get(id: number): Promise<UserEntity> {
    return this.userRepository.findOneByOrFail({ id });
  }

  async create({ details, ...userData }: CreateRequestDto): Promise<UserEntity> {
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
