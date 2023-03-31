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
    region: string;
    credentials: {
      accessKeyId: string;
      secretAccessKey: string;
    };
    kms: {
      key: string;
    };
    s3: {
      url: string;
      bucket: string;
      publicUrl: string;
    };
  };
  redis: Addr;
  grpcServices: {
    core: Addr;
    auth: Addr;
    notifier: Addr;
    websocket: Addr;
  };
  auth: {
    jwt: {
      secret: string;
    };
  };

  app: {
    domain: string;
    prime_trust_url: string;
    koywe_url: string;
    payfura_url: string;
  };

  queues: {
    user_registration: {
      attempts: number;
      delay: number;
    };
    notifications: {
      attempts: number;
      delay: number;
    };
  };
  prime_trust: {
    email: string;
    password: string;
  };

  koywe: {
    client_id: string;
    secret: string;
  };

  payfura: {
    key: string;
    secret: string;
  };

  sendgrid: {
    email: string;
    key: string;
  };
  slicktext: {
    pubKey: string;
    privKey: string;
  };
  telesign: {
    customerId: string;
    apiKey: string;
  };
  ipqualityscore: {
    api_key: string;
  };
  asset: {
    id: string;
    type: string;
    short: string;
  };
}

export default (): ConfigInterface => ({
  basePath: process.cwd(),
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT, 10),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  },
  aws: {
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    kms: {
      key: process.env.KMS_KEY,
    },
    s3: {
      bucket: process.env.AWS_S3_BUCKET || 'test-bucket',
      url: process.env.AWS_S3_URL,
      publicUrl: process.env.AWS_S3_PUBLIC_URL,
    },
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
    notifier: {
      host: process.env.GRPC_NOTIFIER_HOST,
      port: parseInt(process.env.GRPC_NOTIFIER_PORT, 10) || 5000,
    },
    websocket: {
      host: process.env.GRPC_WEBSOCKET_HOST,
      port: parseInt(process.env.GRPC_WEBSOCKET_PORT, 10) || 5000,
    },
  },
  auth: {
    jwt: {
      secret: process.env.AUTH_SECRET ?? 'jwt_sercret',
    },
  },
  app: {
    domain: process.env.APP_DOMAIN,
    prime_trust_url: process.env.PRIME_TRUST_URL,
    koywe_url: process.env.KOYWE_URL,
    payfura_url: process.env.PAYFURA_URL,
  },
  queues: {
    user_registration: {
      attempts: parseInt(process.env.USER_ATTEMPTS, 10) || 5,
      delay: parseInt(process.env.BULLQM_DELAY, 10) || 5000,
    },
    notifications: {
      attempts: parseInt(process.env.NOTIFICATIONS_ATTEMPTS, 10) || 5,
      delay: parseInt(process.env.NOTIFICATIONS_DELAY, 10) || 5000,
    },
  },
  prime_trust: {
    email: process.env.PRIME_EMAIL,
    password: process.env.PRIME_PASSWORD,
  },
  sendgrid: {
    email: process.env.SENDGRID_EMAIL,
    key: process.env.SENDGRID_KEY,
  },
  slicktext: {
    pubKey: process.env.SLICKTEXT_PUB_KEY,
    privKey: process.env.SLICKTEXT_PRIV_KEY,
  },
  telesign: {
    customerId: process.env.TELESIGN_CUSTOMER_ID,
    apiKey: process.env.TELESIGN_API_KEY,
  },
  ipqualityscore: {
    api_key: process.env.IPQUALITYSCORE_KEY,
  },
  koywe: {
    client_id: process.env.KOYWE_ID,
    secret: process.env.KOYWE_SECRET,
  },
  asset: {
    id: process.env.ASSET_ID,
    type: process.env.ASSET_TYPE,
    short: process.env.ASSET_SHORT,
  },
  payfura: {
    key: process.env.PAYFURA_KEY,
    secret: process.env.PAYFURA_SECRET,
  },
});
