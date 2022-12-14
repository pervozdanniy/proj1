import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { asyncClientOptions } from '~common/grpc/helpers';
import { SessionModule } from '~common/session/session.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [ClientsModule.registerAsync([asyncClientOptions('auth')]), SessionModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
