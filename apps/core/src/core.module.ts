import { RedisModule } from '@liaoliaots/nestjs-redis';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration, { ConfigInterface } from '~common/config/configuration';
import { AwsModule } from '~svc/core/src/aws/AwsModule';
import { CountryModule } from '~svc/core/src/country/country.module';
import { NotificationModule } from '~svc/core/src/notification/notification.module';
import { PaymentGatewayModule } from '~svc/core/src/payment-gateway/payment-gateway.module';
import dbConfig from './db/db.config';
import migrations from './db/migrations-list';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ load: [configuration, dbConfig], isGlobal: true }),
    // LoggerModule.forRoot({
    //   pinoHttp: {
    //     transport: {
    //       target: 'pino-pretty',
    //       options: {
    //         singleLine: true,
    //         colorize: true,
    //         ignore: 'time,hostname,req.headers.res.headers',
    //         errorLikeObjectKeys: ['err', 'error'],
    //         customColors: 'err:red,error:red,info:blue',
    //       },
    //     },
    //   },
    // }),
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
    CountryModule,
    NotificationModule,
  ],
})
export class CoreModule {}
