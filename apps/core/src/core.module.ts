import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration, { ConfigInterface } from '~common/config/configuration';
import { AwsModule } from './aws/AwsModule';
import { CountryModule } from './country/country.module';
import dbConfig from './db/db.config';
import migrations from './db/migrations-list';
import { HealthModule } from './health/health.module';
import { NotificationModule } from './notification/notification.module';
import { PaymentGatewayModule } from './payment-gateway/payment-gateway.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ load: [configuration, dbConfig], isGlobal: true }),
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
    UserModule,
    AwsModule,
    CountryModule,
    NotificationModule,
    PaymentGatewayModule,
    HealthModule,
  ],
})
export class CoreModule {}
