import { UserDetailsEntity } from '@/user/entities/user-details.entity';
import { UserEntity } from '@/user/entities/user.entity';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExternalBalanceController } from './controllers/balance.controller';
import { CardsController } from './controllers/cards.controller';
import { InswitchAccountEntity } from './entities/inswitch-account.entity';
import { InswitchCardEntity } from './entities/inswitch-card.entity';
import { InswitchWithdrawAuthorizationEntity } from './entities/inswitch-withdraw.entity';
import { InswitchApiService } from './services/api.service';
import { InswitchCardsService } from './services/cards.service';
import { InswitchService } from './services/inswitch.service';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      InswitchAccountEntity,
      InswitchCardEntity,
      InswitchWithdrawAuthorizationEntity,
      UserEntity,
      UserDetailsEntity,
    ]),
  ],
  providers: [InswitchService, InswitchCardsService, InswitchApiService],
  controllers: [CardsController, ExternalBalanceController],
  exports: [InswitchService],
})
export class InswitchModule {}
