import { Module } from '@nestjs/common';
import { SessionModule } from '~common/session';
import { JwtSessionGuard } from './jwt.guard';
import { JwtSessionMiddleware } from './jwt.middleware';

@Module({
  imports: [SessionModule],
  providers: [JwtSessionMiddleware, JwtSessionGuard],
  exports: [SessionModule, JwtSessionMiddleware, JwtSessionGuard],
})
export class HttpSessionModule {}
