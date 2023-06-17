import dbConfig from '@/db/db.config';
import { FeeEntity } from '@/payment-gateway/modules/fee/entities/fee.entity';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from '~common/config/configuration';
import { FeeAdminController } from './fee.admin.controller';
import { FeeAdminService } from './fee.admin.service';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration, dbConfig], isGlobal: true }),
    TypeOrmModule.forFeature([FeeEntity]),
  ],
  controllers: [FeeAdminController],
  providers: [FeeAdminService],
})
export class FeeAdminModule {}
