import { InterceptorHandler, Server } from '@grpc/grpc-js';
import { GrpcOptions as BaseGrpcOptions, ServerGrpc } from '@nestjs/microservices';
import './server';

export interface GrpcServerInterceptor {
  use: InterceptorHandler;
}

export interface GrpcOptions extends BaseGrpcOptions {
  options: BaseGrpcOptions['options'] & { interceptors?: GrpcServerInterceptor[] };
}

const original = ServerGrpc.prototype.createClient;
ServerGrpc.prototype.createClient = async function () {
  const server: Server = await original.call(this);
  if (this.options.interceptors) {
    for (const interceptor of this.options.interceptors as GrpcServerInterceptor[]) {
      server.use(interceptor.use.bind(interceptor));
    }
  }

  return server;
};
