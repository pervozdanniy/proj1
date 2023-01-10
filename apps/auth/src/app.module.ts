import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration, { ConfigInterface } from '~common/config/configuration';
import { AuthApiModule } from './api/api.module';
import { ClientModule } from './client/client.module';
import dbConfig from './db/db.config';
import migrations from './db/migrations-list';

@Module({
  imports: [
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
  ],
})
export class AppModule {}
