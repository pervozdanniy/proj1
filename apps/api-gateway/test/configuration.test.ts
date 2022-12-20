import * as process from 'process';
import { ConfigInterface } from '~common/config/configuration';

export default (): Partial<ConfigInterface> => ({
  basePath: process.cwd(),
  port: 3000,
  database: {
    host: '127.0.0.1',
    port: parseInt(process.env.DB_LOCAL_PORT, 10),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  },
  redis: {
    host: '127.0.0.1',
    port: parseInt(process.env.REDIS_LOCAL_PORT, 10),
  },
  grpcServices: {
    core: {
      host: '127.0.0.1',
      port: parseInt(process.env.GRPC_CORE_LOCAL_PORT, 10),
    },
    auth: {
      host: '127.0.0.1',
      port: parseInt(process.env.GRPC_AUTH_LOCAL_PORT, 10),
    },
  },
  auth: {
    jwt: {
      secret: 'jwt_sercret',
    },
  },
});
