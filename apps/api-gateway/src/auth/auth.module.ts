import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { asyncClientOptions } from '~common/grpc/helpers';
import { AuthController } from './auth.controller';

@Module({
  imports: [ClientsModule.registerAsync([asyncClientOptions('auth')])],
  controllers: [AuthController],
})
export class AuthModule {}
