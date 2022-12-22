import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import migrations from './migrations-list';
import dbConfig from './db.config';

config();
const { username, password, database } = dbConfig();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: parseInt(process.env.DB_LOCAL_PORT, 10),
  username,
  password,
  database,
  entities: ['../**/*.entity.ts'],
  migrations,
});
