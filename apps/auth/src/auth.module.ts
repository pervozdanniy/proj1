import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule } from '@nestjs/microservices';
import { LoggerModule } from 'nestjs-pino';
import configuration, { ConfigInterface } from '~common/config/configuration';
import { asyncClientOptions } from '~common/grpc/helpers';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionModule } from '~common/session/session.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
            colorize: true,
            ignore: 'time,hostname,req.headers.res.headers',
            errorLikeObjectKeys: ['err', 'error'],
            customColors: 'err:red,error:red,info:blue',
          },
        },
      },
    }),
    RedisModule.forRootAsync({
      useFactory(config: ConfigService<ConfigInterface>) {
        const { host, port } = config.get('redis', { infer: true });

        return { config: { host, port } };
      },
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      useFactory: async (config: ConfigService<ConfigInterface>) => ({
        secret: config.get('auth.jwt.secret', { infer: true }),
        signOptions: { expiresIn: '1y' },
      }),
      inject: [ConfigService],
    }),
    ClientsModule.registerAsync([asyncClientOptions('core')]),
    SessionModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
