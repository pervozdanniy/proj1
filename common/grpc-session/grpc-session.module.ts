import { Module } from '@nestjs/common';
import { SessionModule } from '~common/session';
import { GrpcSessionGuard } from './grpc.guard';
import { GrpcSessionMiddleware } from './grpc.middleware';

@Module({
  imports: [SessionModule],
  providers: [GrpcSessionMiddleware, GrpcSessionGuard],
  exports: [SessionModule, GrpcSessionMiddleware, GrpcSessionGuard],
})
export class GrpcSessionModule {}
