import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigInterface } from '../../../../common/config/configuration';
import migrations from './migrations-list';

export const databaseProviders = [
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
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
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    useFactory(config: ConfigService<ConfigInterface>) {
      const { host, port, username, password, database } = config.get('readonly_database', { infer: true });

      return {
        name: 'core_readonly_database',
        type: 'postgres',
        host,
        port,
        username,
        password,
        database,
        autoLoadEntities: true,
      };
    },
    inject: [ConfigService],
  }),
];
