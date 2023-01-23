import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AuthClient } from '../entities/auth_client.entity';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuthClient]), AuthModule],
  providers: [ClientService],
  controllers: [ClientController],
})
export class ClientModule {}
