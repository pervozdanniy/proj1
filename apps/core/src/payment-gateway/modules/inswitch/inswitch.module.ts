import { UserDetailsEntity } from '@/user/entities/user-details.entity';
import { UserEntity } from '@/user/entities/user.entity';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardsController } from './controllers/cards.controller';
import { InswitchAccountEntity } from './entities/inswitch-account.entity';
import { InswitchCardEntity } from './entities/inswitch-card.entity';
import { InswitchWithdrawEntity } from './entities/inswitch-withdraw.entity';
import { InswitchApiService } from './services/api.service';
import { InswitchCardsService } from './services/cards.service';
import { InswitchService } from './services/inswitch.service';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      InswitchAccountEntity,
      InswitchCardEntity,
      InswitchWithdrawEntity,
      UserEntity,
      UserDetailsEntity,
    ]),
  ],
  providers: [InswitchService, InswitchCardsService, InswitchApiService],
  controllers: [CardsController],
  exports: [InswitchService],
})
export class InswitchModule {}
