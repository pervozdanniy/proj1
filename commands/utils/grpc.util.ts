import { RpcException, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ClientProviderOptions } from '@nestjs/microservices';
import { lastValueFrom, Observable } from 'rxjs';
import {CustomRPCException} from "~command/exceptions/custom-rpc.exception";


export async function handleRPC<T>(request: Observable<T>): Promise<T> {
  try {
    return await lastValueFrom(request);
  } catch (exception) {
    const rpcError = new RpcException(exception);
    const code = rpcError.getError()['code'];
    if (code) {
      const details = JSON.parse(rpcError.getError()['metadata']?.get('details')[0]);
      const { message, error_code } = details;
      console.log(code, message, error_code);
      throw new CustomRPCException(code, message, error_code);
    }
    return exception;
  }
}

export function getGrpcClientOptions(
  dirname: string,
  name: string,
  service: string,
  servicePackage: string,
): ClientProviderOptions {
  return {
    name,
    transport: Transport.GRPC,
    options: {
      url: `${service}:50000`,
      package: servicePackage,
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
      protoPath: join(dirname, `../../../commands/_proto/${service}.proto`),
    },
  };
}
