import {
  GrpcInteceptorContext,
  Metadata,
  sendUnaryData,
  Server,
  ServerErrorResponse,
  ServerUnaryCall,
  ServiceDefinition,
  UntypedServiceImplementation,
} from '@grpc/grpc-js';
import {
  ServerDuplexStream,
  ServerReadableStream,
  ServerStatusResponse,
  ServerSurfaceCall,
  ServerWritableStream,
} from '@grpc/grpc-js/build/src/server-call';

declare module '@grpc/grpc-js' {
  type GrpcInteceptorContext<T extends ServerSurfaceCall = ServerUnaryCall<any, any>> = {
    data: any | null;
    metadata: Metadata;
    call: T;
    error?: ServerErrorResponse | ServerStatusResponse;
  };

  type InterceptorHandler = (ctx: GrpcInteceptorContext<any>, next: (err?: any) => Promise<void>) => void;

  class Server {
    interceptors: Array<InterceptorHandler>;
    use(fn: InterceptorHandler): Server;
    intercept(): Generator<InterceptorHandler>;
  }
}

Server.prototype.interceptors = [];
Server.prototype.use = function (this: Server, fn) {
  this.interceptors.push(fn);

  return this;
};
Server.prototype.intercept = function* intercept(this: Server) {
  let i = 0;
  while (i < this.interceptors.length) {
    yield this.interceptors[i];
    i++;
  }
};

const original = Server.prototype.addService;
Server.prototype.addService = function (
  this: Server,
  service: ServiceDefinition,
  implementation: UntypedServiceImplementation,
) {
  const newImplementation: UntypedServiceImplementation = {};
  for (const k in implementation) {
    const name = k;
    const fn = implementation[k];
    newImplementation[name] = async (
      call:
        | ServerUnaryCall<any, any>
        | ServerReadableStream<any, any>
        | ServerWritableStream<any, any>
        | ServerDuplexStream<any, any>,
      callback?: sendUnaryData<any>,
    ) => {
      const ctx: GrpcInteceptorContext<typeof call> = {
        data: (call as { request: any }).request ?? null,
        metadata: call.metadata,
        call,
      };
      const newCb = (...args: Parameters<typeof callback>) => {
        if (args[0]) {
          ctx.error = args[0];
        }
        callback?.(...args);
      };

      const interceptors = this.intercept();
      const first = interceptors.next();
      if (first.done) {
        // if we don't have any interceptors
        return Promise.resolve(fn(call as any, callback));
      }
      const next = (err?: any) =>
        new Promise((resolve) => {
          if (err) {
            return resolve(newCb(err));
          }
          const i = interceptors.next();
          if (i.done) {
            return resolve(fn(call as any, newCb));
          }
          try {
            return resolve(i.value(ctx, next));
          } catch (error) {
            return resolve(newCb(error));
          }
        });

      try {
        return await first.value(ctx, next);
      } catch (error) {
        return newCb(error);
      }
    };
  }

  return original.call(this, service, newImplementation);
};
