import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user/entities/user.entity';
import { migrations } from './db/migrations/getMigrations';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration, { ConfigInterface } from '~common/config/configuration';
import { UserModule } from './user/user.module';
import { RedisModule } from 'nestjs-redis';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
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
          entities: [UserEntity],
          migrations,
          migrationsRun: true,
        };
      },
      inject: [ConfigService],
    }),
    RedisModule.forRootAsync({
      useFactory(config: ConfigService<ConfigInterface>) {
        const { host, port } = config.get('redis', { infer: true });

        return { host, port };
      },
      inject: [ConfigService],
    }),
    UserModule,
  ],
})
export class CoreModule {}
