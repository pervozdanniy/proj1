import { Catch, ArgumentsHost } from '@nestjs/common';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { GrpcException } from '../exceptions/grpc.exception';
import { status } from '@grpc/grpc-js';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';

@Catch()
export class TypeOrmExceptionFilter extends BaseRpcExceptionFilter {
  catch(exception: EntityNotFoundError | QueryFailedError | RpcException, host: ArgumentsHost) {
    let finalException = exception;

    if (exception instanceof EntityNotFoundError) {
      finalException = new GrpcException(status.NOT_FOUND, 'Not Found', 404);
    }

    if (exception instanceof QueryFailedError && exception.message.includes('duplicate key')) {
      finalException = new GrpcException(status.ALREADY_EXISTS, 'Duplicate Entry', 400);
    }

    return super.catch(finalException, host);
  }
}
