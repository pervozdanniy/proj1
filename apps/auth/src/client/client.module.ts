import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthApiModule } from '../api/api.module';
import { AuthClient } from '../entities/auth_client.entity';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuthClient]), AuthApiModule],
  providers: [ClientService],
  controllers: [ClientController],
})
export class ClientModule {}
