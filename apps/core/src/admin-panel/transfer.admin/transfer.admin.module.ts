import dbConfig from '@/db/db.config';
import { TransfersEntity } from '@/payment-gateway/entities/transfers.entity';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from '~common/config/configuration';
import { TransferAdminController } from './transfer.admin.controller';
import { TransferAdminService } from './transfer.admin.service';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration, dbConfig], isGlobal: true }),
    TypeOrmModule.forFeature([TransfersEntity]),
  ],
  controllers: [TransferAdminController],
  providers: [TransferAdminService],
})
export class TransferAdminModule {}
