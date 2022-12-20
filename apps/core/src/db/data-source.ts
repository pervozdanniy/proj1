import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import configuration, { ConfigInterface } from '~common/config/configuration';
import migrations from './migrations-list';

config();
const cs = new ConfigService<ConfigInterface>(configuration());
const { username, password, database } = cs.get('database', { infer: true });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: parseInt(process.env.DB_PORT, 10),
  username,
  password,
  database,
  entities: ['../**/*.entity.ts'],
  migrations,
});
