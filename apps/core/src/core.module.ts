import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration, { ConfigInterface } from '~common/config/configuration';
import { UserModule } from './user/user.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { LoggerModule } from 'nestjs-pino';
import { AwsModule } from '~svc/core/src/aws/AwsModule';
import migrations from './db/migrations-list';
import { PaymentGatewayModule } from '~svc/core/src/payment-gateway/payment-gateway.module';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
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
    TypeOrmModule.forRootAsync({
      useFactory(config: ConfigService<ConfigInterface>) {
        const { host, port, username, password, database } = config.get('database', { infer: true });

        return {
          type: 'postgres',
          host,
          port,
          username,
          password,
          database,
          autoLoadEntities: true,
          migrations,
          migrationsRun: true,
        };
      },
      inject: [ConfigService],
    }),
    RedisModule.forRootAsync({
      useFactory(config: ConfigService<ConfigInterface>) {
        const { host, port } = config.get('redis', { infer: true });

        return { config: { host, port } };
      },
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService<ConfigInterface>) => ({
        redis: config.get('redis', { infer: true }),
      }),
      inject: [ConfigService],
    }),
    UserModule,
    PaymentGatewayModule,
    AwsModule,
  ],
})
export class CoreModule {}
