import { REDIS_CLIENTS } from '@liaoliaots/nestjs-redis/dist/redis/redis.constants';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import { join } from 'path';
import configuration, { ConfigInterface } from '~common/config/configuration';
import { asyncClientOptions } from '~common/grpc/helpers';
import { SessionModule } from '~common/session';
import { AuthApiController } from '~svc/auth/src/api/controllers/api.controller';
import { AuthApiService } from '~svc/auth/src/api/services/api.service';
import { ApiSocialsService } from '~svc/auth/src/api/services/api.socials.service';
import { Auth2FAService } from '~svc/auth/src/auth-2fa/2fa.service';
import { AuthModule } from '~svc/auth/src/auth/auth.module';
import redisClients from '../../__mocks/redis';
import testConfig from './configuration';

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
      SessionModule,
      AuthModule,
    ],
    controllers: [AuthApiController],
    providers: [
      AuthApiService,
      ApiSocialsService,
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
    .compile();

  return auth.createNestMicroservice({
    transport: Transport.GRPC,
    options: {
      url: `localhost:${config.get('grpcServices.auth.port', { infer: true })}`,
      package: 'skopa.auth',
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
      protoPath: join(config.get('basePath'), 'common/grpc/_proto/auth.proto'),
    },
  });
};
