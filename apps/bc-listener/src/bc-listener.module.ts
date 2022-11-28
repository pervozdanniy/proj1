import { Module } from '@nestjs/common';
import { BcListenerController } from './bc-listener.controller';
import { BcListenerService } from './bc-listener.service';

@Module({
  imports: [],
  controllers: [BcListenerController],
  providers: [BcListenerService],
})
export class BcListenerModule {}
