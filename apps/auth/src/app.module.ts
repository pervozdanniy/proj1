import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration, { ConfigInterface } from '~common/config/configuration';
import { GrpcSessionModule } from '~common/grpc-session';
import { AuthApiModule } from './api/api.module';
import { ClientModule } from './client/client.module';
import dbConfig from './db/db.config';
import migrations from './db/migrations-list';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration, dbConfig], isGlobal: true }),
    RedisModule.forRootAsync({
      useFactory(config: ConfigService<ConfigInterface>) {
        const { host, port } = config.get('redis', { infer: true });

        return { config: { host, port } };
      },
      inject: [ConfigService],
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
    AuthApiModule,
    ClientModule,
    GrpcSessionModule,
    HealthModule,
  ],
})
export class AppModule {}
