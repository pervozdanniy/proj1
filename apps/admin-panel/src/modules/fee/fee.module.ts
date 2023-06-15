import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { asyncClientOptions } from '~common/grpc/helpers';
import { FeeController } from './fee.controller';
import { FeeService } from './fee.service';

@Module({
  imports: [ClientsModule.registerAsync([asyncClientOptions('core')])],
  controllers: [FeeController],
  providers: [FeeService],
})
export class FeeModule {}
