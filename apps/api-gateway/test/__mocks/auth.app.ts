import { REDIS_CLIENTS } from '@liaoliaots/nestjs-redis/dist/redis/redis.constants';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { join } from 'path';
import configuration, { ConfigInterface } from '~common/config/configuration';
import { GrpcSessionMiddleware } from '~common/grpc-session';
import { asyncClientOptions } from '~common/grpc/helpers';
import { HttpSessionModule } from '~common/http-session';
import { AuthApiController } from '~svc/auth/src/api/controllers/api.controller';
import { AuthApiService } from '~svc/auth/src/api/services/api.service';
import { ApiSocialsService } from '~svc/auth/src/api/services/api.socials.service';
import { ApiRegisterService } from '~svc/auth/src/api/services/register.service';
import { Auth2FAService } from '~svc/auth/src/auth-2fa/2fa.service';
import { AuthModule } from '~svc/auth/src/auth/auth.module';
import { RefreshTokenEntity } from '~svc/auth/src/entities/refresh-token.entity';
import testConfig from './configuration';
import redisClients from './redis';
import refreshTokenRepoFactory from './refresh-token.respository';

export default async (config: ConfigService<ConfigInterface>) => {
  const auth = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ load: [configuration, testConfig], isGlobal: true }),
      JwtModule.registerAsync({
        useFactory: async (config: ConfigService<ConfigInterface>) => ({
          secret: config.get('auth.jwt.secret', { infer: true }),
          signOptions: { expiresIn: '1y' },
        }),
        inject: [ConfigService],
      }),
      ClientsModule.registerAsync([asyncClientOptions('core')]),
      HttpSessionModule,
      AuthModule,
    ],
    controllers: [AuthApiController],
    providers: [
      AuthApiService,
      ApiSocialsService,
      ApiRegisterService,
      {
        provide: Auth2FAService,
        useFactory: jest.fn(() => ({
          requireIfEnabled: jest.fn(() => []),
        })),
      },
    ],
  })
    .overrideProvider(REDIS_CLIENTS)
    .useValue(redisClients)
    .overrideProvider(getRepositoryToken(RefreshTokenEntity))
    .useFactory({ factory: refreshTokenRepoFactory })
    .compile();

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
