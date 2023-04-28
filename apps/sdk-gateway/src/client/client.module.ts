import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { asyncClientOptions } from '~common/grpc/helpers';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';

@Module({
  imports: [ClientsModule.registerAsync([asyncClientOptions('core'), asyncClientOptions('auth')])],
  controllers: [ClientController],
  providers: [ClientService],
})
export class ClientModule {}
