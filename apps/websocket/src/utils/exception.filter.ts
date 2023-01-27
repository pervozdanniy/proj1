import { Catch } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import * as Sentry from '@sentry/node';

@Catch()
export class AllExceptionsFilter extends BaseWsExceptionFilter {
  handleUnknownError(exception, client): void {
    Sentry.captureException(exception);

    return super.handleUnknownError(exception, client);
  }
}
