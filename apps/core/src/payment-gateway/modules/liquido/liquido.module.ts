import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiquidoWithdrawAuthorizationEntity } from './entities/liquido_withdraw_authorization.entity';
import { LiquidoService } from './services/liquido.service';

@Module({
  imports: [TypeOrmModule.forFeature([LiquidoWithdrawAuthorizationEntity])],
  providers: [LiquidoService],
  exports: [LiquidoService],
})
export class LiquidoModule {}
