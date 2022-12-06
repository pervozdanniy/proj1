type Addr = {
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
  redis: Addr;
  grpcServices: {
    core: Addr;
    auth: Addr;
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
});
