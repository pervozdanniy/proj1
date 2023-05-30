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
      accessTokenTtl: number;
      refreshTokenTtl: number;
    };
  };

  app: {
    domain: string;
    prime_trust_url: string;
    koywe_url: string;
    facilita_url: string;
    veriff_url: string;
    link_url: string;
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
    skopaAccountId: string;
    skopaKoyweAccountId: string;
    skopaKoyweWallet: string;
    koyweLiquidoWallet: string;
  };

  koywe: {
    client_id: string;
    secret: string;
  };
  inswitch: {
    url: string;
    apiKey: string;
    username: string;
    password: string;
    withdrawWallet: string;
    cards: {
      virtualCardProductId?: string;
      physicalCardProductId?: string;
    };
  };
  liquido: {
    client_id: string;
    secret: string;
    x_api_key: string;
    auth_url: string;
    api_url: string;
  };

  facilita: {
    username: string;
    password: string;
  };

  veriff: {
    api_key: string;
    secret: string;
  };

  link: {
    client_id: string;
    secret_key: string;
    merchant_id: string;
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
  api_layer: {
    key: string;
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
      // accessTokenTtl: parseInt(process.env.AUTH_ACCESS_TOKEN_TTL, 10) || 60 * 60,
      // refreshTokenTtl: parseInt(process.env.AUTH_REFRESH_TOKEN_TTL, 10) || 24 * 60 * 60,
      accessTokenTtl: 24 * 60 * 60,
      refreshTokenTtl: 360 * 24 * 60 * 60,
      secret: process.env.AUTH_SECRET ?? 'jwt_sercret',
    },
  },
  app: {
    domain: process.env.APP_DOMAIN,
    prime_trust_url: process.env.PRIME_TRUST_URL,
    koywe_url: process.env.KOYWE_URL,
    facilita_url: process.env.FACILITA_URL,
    veriff_url: process.env.VERIFF_BASE_URL,
    link_url: process.env.LINK_URL,
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
    skopaAccountId: process.env.SKOPA_ACCOUNT_ID,
    skopaKoyweAccountId: process.env.SKOPA_KOYWE_ACCOUNT_ID,
    skopaKoyweWallet: process.env.SKOPA_KOYWE_WALLET,
    koyweLiquidoWallet: process.env.KOYWE_LIQUIDO_WALLET,
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
  facilita: {
    username: process.env.FACILITA_USERNAME,
    password: process.env.FACILITA_PASSWORD,
  },
  veriff: {
    api_key: process.env.VERIFF_API_KEY,
    secret: process.env.VERIFF_SECRET,
  },
  liquido: {
    client_id: process.env.LIQUIDO_ID,
    secret: process.env.LIQUIDO_SECRET,
    x_api_key: process.env.LIQUIDO_X_API_KEY,
    api_url: process.env.LIQUIDO_API_URL,
    auth_url: process.env.LIQUIDO_AUTH_URL,
  },
  inswitch: {
    url: process.env.INSWITCH_API_URL,
    apiKey: process.env.INSWITCH_API_KEY,
    username: process.env.INSWITCH_USERNAME,
    password: process.env.INSWITCH_PASSWORD,
    withdrawWallet: process.env.INSWITCH_WITDRAW_WALLET,
    cards: {
      virtualCardProductId: process.env.INSWITCH_VIRTUAL_CARD_PRODUCT_ID,
      physicalCardProductId: process.env.INSWITCH_PHYSICAL_CARD_PRODUCT_ID,
    },
  },
  link: {
    merchant_id: process.env.LINK_MERCHANT_ID,
    client_id: process.env.LINK_CLIENT_ID,
    secret_key: process.env.LINK_SECRET_KEY,
  },
  api_layer: {
    key: process.env.API_LAYER_KEY,
  },
});
