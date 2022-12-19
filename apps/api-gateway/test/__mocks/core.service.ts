import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { join } from 'path';
import { ConfigInterface } from '~common/config/configuration';
<<<<<<< HEAD
import { PaymentGatewayController } from '~svc/core/src/payment-gateway/controllers/payment-gateway.controller';
import { PaymentGatewayService } from '~svc/core/src/payment-gateway/services/payment.gateway.service';
import { UserController } from '~svc/core/src/user/controllers/user.controller';
import { UserDetailsEntity } from '~svc/core/src/user/entities/user-details.entity';
import { UserEntity } from '~svc/core/src/user/entities/user.entity';
import { UserService } from '~svc/core/src/user/services/user.service';
import userDetailRepoMock from './user-detail.repository';
=======
import { UserController } from '~svc/core/src/user/controllers/user.controller';
import { UserEntity } from '~svc/core/src/user/entities/user.entity';
import { UserService } from '~svc/core/src/user/services/user.service';
>>>>>>> 492ba48 (SKOPA-99: added integration tests)
import userRepoMock from './user.repository';

export default async (config: ConfigService<ConfigInterface>) => {
  const moduleFixture = await Test.createTestingModule({
    providers: [
      UserService,
      {
        provide: PaymentGatewayService,
        useValue: {
          createUser: jest.fn().mockResolvedValue(false),
        },
      },
      {
        provide: getRepositoryToken(UserEntity),
        useValue: userRepoMock,
      },
      {
        provide: getRepositoryToken(UserDetailsEntity),
        useValue: userDetailRepoMock,
      },
    ],
    controllers: [UserController, PaymentGatewayController],
  }).compile();

  return moduleFixture.createNestMicroservice({
    transport: Transport.GRPC,
    options: {
      url: `localhost:${config.get('grpcServices.core.port', { infer: true })}`,
      package: 'skopa.core',
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
      protoPath: join(config.get('basePath'), 'common/grpc/_proto/core.proto'),
    },
  });
};
