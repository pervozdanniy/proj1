import { ClientsProviderAsyncOptions, RpcException, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { lastValueFrom, Observable } from 'rxjs';
import { GRPCException } from '~common/exceptions/grpc.exception';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigInterface } from '~common/config/configuration';

const GRPC_PREFIX = '_grpc';

const buildGrpcProviderName = (name: string) => `${GRPC_PREFIX}_${name}`;

export const InjectGrpc = (name: string) => Inject(buildGrpcProviderName(name));

export const asyncClientOptions = (
  service: keyof ConfigInterface['grpcServices'],
  packages: string | string[] = service,
): ClientsProviderAsyncOptions => ({
  name: buildGrpcProviderName(service),
  useFactory(config: ConfigService<ConfigInterface>) {
    const basePath = config.getOrThrow<string>('basePath');
    const host = config.getOrThrow<string>(`grpcServices.${service}.host`, { infer: true });
    const protoPath = Array.isArray(packages)
      ? packages.map((path) => join(basePath, 'common/grpc/_proto', `${path}.proto`))
      : join(basePath, 'common/grpc/_proto', `${packages}.proto`);

    return {
      transport: Transport.GRPC,
      options: {
        url: `${host}:5000`,
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

export async function handleRPC<T>(request: Observable<T>): Promise<T> {
  try {
    return await lastValueFrom(request);
  } catch (exception) {
    const rpcError = new RpcException(exception);
    const code = rpcError.getError()['code'];
    if (code) {
      const details = JSON.parse(rpcError.getError()['metadata']?.get('details')[0]);
      const { message, error_code } = details;

      throw new GRPCException(code, message, error_code);
    }

    return exception;
  }
}
