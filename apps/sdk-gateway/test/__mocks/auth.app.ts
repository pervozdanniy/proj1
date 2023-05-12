import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { join } from 'path';
import configuration, { ConfigInterface } from '~common/config/configuration';
import { GrpcSessionMiddleware } from '~common/grpc-session';
import { asyncClientOptions } from '~common/grpc/helpers';
import { SessionService } from '~common/session';
import { AuthService } from '~svc/auth/src/auth/auth.service';
import { TokenService } from '~svc/auth/src/auth/token.service';
import { ClientController } from '~svc/auth/src/client/client.controller';
import { ClientService } from '~svc/auth/src/client/client.service';
import { AuthClient } from '~svc/auth/src/entities/auth_client.entity';
import { RefreshTokenEntity } from '~svc/auth/src/entities/refresh-token.entity';
import authClientRepoFactory from './auth-client.repository';
import testConfig from './configuration';
import refreshTokenRepoFactory from './refresh-token.respository';

export default async (config: ConfigService<ConfigInterface>) => {
  const auth = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ load: [configuration, testConfig], isGlobal: true }),
      ClientsModule.registerAsync([asyncClientOptions('core'), asyncClientOptions('notifier')]),
    ],
    controllers: [ClientController],
    providers: [
      GrpcSessionMiddleware,
      ClientService,
      AuthService,
      TokenService,
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
      { provide: getRepositoryToken(RefreshTokenEntity), useFactory: refreshTokenRepoFactory },
    ],
  }).compile();

  return auth.createNestMicroservice({
    transport: Transport.GRPC,
    options: {
      interceptors: [auth.get(GrpcSessionMiddleware)],
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
