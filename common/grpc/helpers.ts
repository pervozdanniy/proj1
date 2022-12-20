import { ClientsProviderAsyncOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Addr, ConfigInterface } from '~common/config/configuration';

const GRPC_PREFIX = '_grpc';

const buildGrpcProviderName = (name: string) => `${GRPC_PREFIX}_${name}`;

const buildProtoPath = (basePath: string) => (packageName: GrpcPackage) => {
  const filename = `${packageName.split('.')[1]}.proto`;

  return join(basePath, 'common/grpc/_proto', filename);
};

export const InjectGrpc = (name: string) => Inject(buildGrpcProviderName(name));

export type GrpcService = keyof ConfigInterface['grpcServices'];

export type GrpcPackage = `skopa.${GrpcService}`;

export const asyncClientOptions = (
  service: GrpcService,
  packages: GrpcPackage | GrpcPackage[] = `skopa.${service}`,
): ClientsProviderAsyncOptions => ({
  name: buildGrpcProviderName(service),
  useFactory(config: ConfigService<ConfigInterface>) {
    const resolve = buildProtoPath(config.getOrThrow<string>('basePath'));
    const protoPath = Array.isArray(packages) ? packages.map(resolve) : resolve(packages);

    const { host, port } = config.getOrThrow<Addr>(`grpcServices.${service}`, { infer: true });

    return {
      transport: Transport.GRPC,
      options: {
        url: `${host}:${port}`,
        package: packages,
        loader: {
          keepCase: true,
          longs: String,
          enums: String,
          defaults: true,
          oneofs: true,
        },
        protoPath,
      },
    };
  },
  inject: [ConfigService],
});
