import * as Sentry from '@sentry/node';

export default function sentryInit() {
  Sentry.init({
    dsn: process.env.DSN,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
    ],
    tracesSampleRate: 1.0,
  });

  const transaction = Sentry.startTransaction({
    op: 'transaction',
    name: 'My Transaction',
  });

  Sentry.configureScope((scope) => {
    scope.setSpan(transaction);
  });

  console.log('Sentry initialized!');
}
