import * as process from 'process';
import { ConfigInterface } from '~common/config/configuration';

export default (): Partial<ConfigInterface> => ({
  basePath: process.cwd(),
  port: 3000,
  grpcServices: {
    core: {
      host: '127.0.0.1',
      port: parseInt(process.env.GRPC_CORE_LOCAL_PORT, 10),
    },
    auth: {
      host: '127.0.0.1',
      port: parseInt(process.env.GRPC_AUTH_LOCAL_PORT, 10),
    },
    notifier: {
      host: '127.0.0.1',
      port: parseInt(process.env.GRPC_NOTIFIER_LOCAL_PORT, 10),
    },
    websocket: {
      host: '127.0.0.1',
      port: parseInt(process.env.GRPC_WEBSOCKETLOCAL_PORT, 10),
    },
  },
  auth: {
    jwt: {
      accessTokenTtl: 60 * 60,
      refreshTokenTtl: 24 * 60 * 60,
      secret: 'jwt_sercret',
    },
  },
});
