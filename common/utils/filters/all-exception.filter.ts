import { Catch, HttpException, RpcExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as Sentry from '@sentry/node';
import { Observable, throwError } from 'rxjs';
import { GrpcException } from '../exceptions/grpc.exception';

@Catch()
export class AllExceptionFilter implements RpcExceptionFilter<unknown> {
  catch(exception: unknown): Observable<any> {
    console.log('HOBA', exception);
    if (exception instanceof HttpException) {
      const wrap = GrpcException.fromHttp(exception);

      return throwError(() => wrap.getError());
    }

    Sentry.captureException({ exception });

    return throwError(() => new RpcException({ message: 'Unknown error', exception }).getError());
  }
}
