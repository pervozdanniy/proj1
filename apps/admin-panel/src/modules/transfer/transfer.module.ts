import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { asyncClientOptions } from '~common/grpc/helpers';
import { TransferController } from './transfer.controller';
import { TransferService } from './transfer.service';

@Module({
  imports: [ClientsModule.registerAsync([asyncClientOptions('core')])],
  controllers: [TransferController],
  providers: [TransferService],
})
export class TransferModule {}
