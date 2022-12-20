import * as process from 'process';

export type Addr = {
  host: string;
  port: number;
};

export interface ConfigInterface {
  basePath: string;
  port: number;
  database: Addr & {
    username: string;
    password: string;
    database: string;
  };
  aws: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  };
  kms: {
    key: string;
  };
  redis: Addr;
  grpcServices: {
    core: Addr;
    auth: Addr;
  };
  auth: {
    jwt: {
      secret: string;
    };
  };
}

export default (): ConfigInterface => ({
  basePath: process.env.BASE_PATH,
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT, 10),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  },
  aws: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION,
  },
  kms: {
    key: process.env.KMS_KEY,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
  },
  grpcServices: {
    core: {
      host: process.env.GRPC_CORE_HOST,
      port: parseInt(process.env.GRPC_CORE_PORT, 10) || 5000,
    },
    auth: {
      host: process.env.GRPC_AUTH_HOST,
      port: parseInt(process.env.GRPC_AUTH_PORT, 10) || 5000,
    },
  },
  auth: {
    jwt: {
      secret: process.env.AUTH_SECRET ?? 'jwt_sercret',
    },
  },
});
