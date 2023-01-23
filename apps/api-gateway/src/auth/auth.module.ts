import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { asyncClientOptions } from '~common/grpc/helpers';
import { SessionModule } from '~common/session/session.module';
import { TwoFactorController } from './controllers/2fa.controller';
import { AuthController } from './controllers/auth.controller';
import { TwoFactorService } from './services/2fa.service';
import { AuthService } from './services/auth.service';

@Module({
  imports: [ClientsModule.registerAsync([asyncClientOptions('auth')]), SessionModule],
  controllers: [AuthController, TwoFactorController],
  providers: [AuthService, TwoFactorService],
})
export class AuthModule {}
