import { Catch, HttpException, Logger, RpcExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as Sentry from '@sentry/node';
import { Observable, throwError } from 'rxjs';
import { GrpcException } from '../exceptions/grpc.exception';

@Catch()
export class AllExceptionFilter implements RpcExceptionFilter<unknown> {
  private readonly logger = new Logger(AllExceptionFilter.name);

  catch(exception: unknown): Observable<any> {
    if (exception instanceof HttpException) {
      const wrap = GrpcException.fromHttp(exception);

      return throwError(() => wrap.getError());
    }
    this.logger.debug('Uknown exeption', exception);

    Sentry.captureException({ exception });

    return throwError(() => new RpcException({ message: 'Unknown error', exception }).getError());
  }
}
