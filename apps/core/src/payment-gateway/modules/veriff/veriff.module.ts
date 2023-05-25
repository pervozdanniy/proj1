import { UserModule } from '@/user/user.module';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VeriffDocumentEntity } from './entities/veriff-document.entity';
import { VeriffService } from './services/veriff.service';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([VeriffDocumentEntity]), UserModule],
  providers: [VeriffService],
  exports: [VeriffService],
})
export class VeriffModule {}
