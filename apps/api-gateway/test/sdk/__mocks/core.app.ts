import { MainService } from '@/payment-gateway/services/main.service';
import { PaymentGatewayWebhooksService } from '@/payment-gateway/services/payment-gateway-webhooks.service';
import { PaymentGatewayService } from '@/payment-gateway/services/payment-gateway.service';
import { UserCheckService } from '@/user/services/user-check.service';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { join } from 'path';
import { ConfigInterface } from '~common/config/configuration';
import { CountryService } from '~svc/core/src/country/country.service';
import { CountryEntity } from '~svc/core/src/country/entities/country.entity';
import { PaymentGatewayController } from '~svc/core/src/payment-gateway/controllers/payment-gateway.controller';
import { UserFacadeController } from '~svc/core/src/user-facade/user-facade.controller';
import { UserDetailsEntity } from '~svc/core/src/user/entities/user-details.entity';
import { UserEntity } from '~svc/core/src/user/entities/user.entity';
import { UserContactService } from '~svc/core/src/user/services/user-contact.service';
import { UserService } from '~svc/core/src/user/services/user.service';
import countryRepoMockFactory from '../../__mocks/country.repository';
import userRepoMockFactory from '../../__mocks/user.repository';

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
        provide: MainService,
        useValue: {
          createUser: jest.fn().mockResolvedValue(false),
        },
      },
      {
        provide: PaymentGatewayWebhooksService,
        useValue: {
          createUser: jest.fn().mockResolvedValue(false),
        },
      },
      {
        provide: CountryService,
        useFactory: jest.fn(() => ({
          checkUSA: jest.fn(),
        })),
      },
      {
        provide: UserCheckService,
        useFactory: jest.fn(() => ({
          checkUserData: jest.fn(),
        })),
      },
      {
        provide: UserContactService,
        useFactory: jest.fn(() => ({
          update: jest.fn().mockResolvedValue(undefined),
          detouch: jest.fn().mockResolvedValue(undefined),
        })),
      },
      {
        provide: getRepositoryToken(UserEntity),
        useFactory: userRepoMockFactory,
      },
      {
        provide: getRepositoryToken(UserDetailsEntity),
        useValue: {},
      },
      {
        provide: getRepositoryToken(CountryEntity),
        useFactory: countryRepoMockFactory,
      },
    ],
    controllers: [UserFacadeController, PaymentGatewayController],
  }).compile();

  return moduleFixture.createNestMicroservice({
    transport: Transport.GRPC,
    options: {
      url: `localhost:${config.get('grpcServices.core.port', { infer: true })}`,
      package: 'skopa.core',
      loader: {
        keepCase: true,
        longs: String,
        defaults: true,
        oneofs: true,
      },
      protoPath: join(config.get('basePath'), 'common/grpc/_proto/core.proto'),
    },
  });
};
