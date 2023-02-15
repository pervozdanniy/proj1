import { Metadata } from '@grpc/grpc-js';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ApiKey = createParamDecorator((param: never, ctx: ExecutionContext) => {
  const metadata = ctx.switchToRpc().getContext<Metadata>();
  const [apiKey] = metadata.get('api-key');

  return apiKey?.toString();
});
