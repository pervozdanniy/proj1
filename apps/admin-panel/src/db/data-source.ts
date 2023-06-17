import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import dbConfig from './config/db.config';
import migrations from './migrations-list';

config();
const { username, password, database } = dbConfig();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: parseInt(process.env.DB_LOCAL_PORT, 10),
  username,
  password,
  database,
  entities: ['apps/admin-panel/src/**/*.entity.ts'],
  migrations,
});
