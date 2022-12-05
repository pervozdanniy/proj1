import { Catch, ArgumentsHost } from '@nestjs/common';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { CustomRPCException } from '../exceptions/custom-rpc.exception';
import { status } from '@grpc/grpc-js';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';

@Catch()
export class TypeOrmExceptionFilter extends BaseRpcExceptionFilter {
  catch(
    exception: EntityNotFoundError | QueryFailedError | RpcException,
    host: ArgumentsHost,
  ) {
    let finalException = exception;

    if (exception instanceof EntityNotFoundError) {
      finalException = new CustomRPCException(
        status.NOT_FOUND,
        'Not Found',
        404,
      );
    }

    if (
      exception instanceof QueryFailedError &&
      exception.message.includes('duplicate key')
    ) {
      finalException = new CustomRPCException(
        status.ALREADY_EXISTS,
        'Duplicate Entry',
        400,
      );
    }
    return super.catch(finalException, host);
  }
}
