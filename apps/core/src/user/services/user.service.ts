import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { AwsKmsService } from '~svc/core/src/aws/services/aws.kms.service';
import { AwsSqsProducerService } from '~svc/core/src/aws/services/aws.sqs.producer.service';
import { CreateRequestDto } from '../dto/create.request.dto';
import { PaymentGatewayManager } from '~svc/core/src/payment-gateway/manager/payment.gateway.manager';
import { PrimeTrustUserEntity } from '~svc/core/src/user/entities/prime.trust.user.entity';
import { generatePassword } from '~common/helpers';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @Inject(AwsKmsService)
    private awsService: AwsKmsService,

    @Inject(AwsSqsProducerService)
    private sqsMessageProducer: AwsSqsProducerService,

    @Inject(PaymentGatewayManager)
    private paymentGatewayManager: PaymentGatewayManager,

    private dataSource: DataSource,
  ) {}

  async get(id: number): Promise<UserEntity> {
    return this.userRepository.findOneByOrFail({ id });
  }

  async create(payload: CreateRequestDto): Promise<UserEntity> {
    const { username, email } = payload;
    const user = await this.userRepository.save(this.userRepository.create(payload));
    const userDetails = await this.userRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.country', 'c')
      .leftJoinAndSelect('c.payment_gateway', 'p')
      .where('u.id = :id', { id: user.id })
      .getOne();
    const password = generatePassword(true, true, 16);
    const paymentGateway = this.paymentGatewayManager.callApiGatewayService(userDetails.country.payment_gateway.alias);
    const userResponse = await paymentGateway.createUser({ name: username, password, email });
    console.log(userResponse);
    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(PrimeTrustUserEntity)
      .values([
        {
          name: userResponse.attributes.name,
          email: userResponse.attributes.email,
          password,
          disabled: userResponse.attributes.disabled,
          user_id: user.id,
        },
      ])
      .execute();
    await this.userRepository
      .createQueryBuilder()
      .update(UserEntity)
      .set({
        status: 'active',
      })
      .where('id = :id', { id: user.id })
      .execute();

    return user;
  }

  findByLogin(login: string) {
    return this.userRepository.findOneBy({ email: login });
  }

  async delete(id: number) {
    const { affected } = await this.userRepository.delete(id);

    return affected === 1;
  }
}
