import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { join } from 'path';
import configuration, { ConfigInterface } from '~common/config/configuration';
import { asyncClientOptions } from '~common/grpc/helpers';
import { SessionService } from '~common/session';
import { AuthService } from '~svc/auth/src/auth/auth.service';
import { ClientController } from '~svc/auth/src/client/client.controller';
import { ClientService } from '~svc/auth/src/client/client.service';
import { AuthClient } from '~svc/auth/src/entities/auth_client.entity';
import authClientRepoFactory from './auth-client.repository';
import testConfig from './configuration';

export default async (config: ConfigService<ConfigInterface>) => {
  const auth = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ load: [configuration, testConfig], isGlobal: true }),
      ClientsModule.registerAsync([asyncClientOptions('core')]),
    ],
    controllers: [ClientController],
    providers: [
      ClientService,
      AuthService,
      { provide: JwtService, useValue: { signAsync: jest.fn().mockResolvedValue('mock_jwt') } },
      {
        provide: SessionService,
        useValue: {
          generate: jest.fn(() => ({
            save: jest.fn().mockResolvedValue(true),
            id: 'mock_session_id',
          })),
        },
      },
      { provide: getRepositoryToken(AuthClient), useFactory: authClientRepoFactory },
    ],
  }).compile();

  return auth.createNestMicroservice({
    transport: Transport.GRPC,
    options: {
      url: `localhost:${config.get('grpcServices.auth.port', { infer: true })}`,
      package: 'skopa.auth',
      loader: {
        keepCase: true,
        longs: String,
        defaults: true,
        oneofs: true,
      },
      protoPath: join(config.get('basePath'), 'common/grpc/_proto/auth.proto'),
    },
  });
};
