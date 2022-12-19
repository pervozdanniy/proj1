import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { AwsKmsService } from '~svc/core/src/aws/services/aws.kms.service';
import { AwsSqsProducerService } from '~svc/core/src/aws/services/aws.sqs.producer.service';
import { CreateRequestDto } from '../dto/create.request.dto';
import { PrimeTrustUserEntity } from '~svc/core/src/user/entities/prime.trust.user.entity';
import { UserDetailsEntity } from '~svc/core/src/user/entities/user.details.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    @InjectRepository(UserDetailsEntity)
    private userDetailsRepository: Repository<UserDetailsEntity>,

    @InjectRepository(PrimeTrustUserEntity)
    private primeUserRepository: Repository<PrimeTrustUserEntity>,

    @Inject(AwsKmsService)
    private awsService: AwsKmsService,

    @Inject(AwsSqsProducerService)
    private sqsMessageProducer: AwsSqsProducerService,
  ) {}

  async get(id: number): Promise<UserEntity> {
    return this.userRepository.findOneByOrFail({ id });
  }

  async create(payload: CreateRequestDto): Promise<UserEntity> {
    const { details } = payload;
    const user = await this.userRepository.save(this.userRepository.create(payload));
    await this.userDetailsRepository.save(this.userDetailsRepository.create({ user_id: user.id, ...details }));

    return user;
  }

  async getUserInfo(user) {
    const userDetails = await this.userRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.country', 'c')
      .leftJoinAndSelect('c.payment_gateway', 'p')
      .where('u.id = :id', { id: user.id })
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
