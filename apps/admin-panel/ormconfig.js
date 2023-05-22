/* eslint-disable */
require('dotenv').config();

const { host, port, username, password, database } = require('./src/db/config/db.config').default();

module.exports = {
  type: 'postgres',
  host,
  port,
  username,
  password,
  database,
  seeds: ['./apps/admin-panel/src/db/seeds/*{.ts,.js}'],
  factories: ['./apps/admin-panel/src/db/seeds/*{.ts,.js}'],
  entities: ['./apps/admin-panel/src/**/*.entity.ts'],
};
