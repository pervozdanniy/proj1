import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeeEntity } from './entities/fee.entity';
import { FeeService } from './fee.service';

@Module({
  imports: [TypeOrmModule.forFeature([FeeEntity])],
  providers: [FeeService],
  exports: [FeeService],
})
export class FeeModule {}
