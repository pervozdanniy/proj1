import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '~svc/core/src/user/entities/user.entity';
import { InswitchAccountEntity } from '../../entities/inswitch/inswitch-account.entity';
import { InswitchApiService } from './api.service';

@Injectable()
export class InswitchService {
  constructor(
    private readonly api: InswitchApiService,
    @InjectRepository(InswitchAccountEntity) private readonly inswitchRepo: Repository<InswitchAccountEntity>,
  ) {}

  async registerUser(user: UserEntity) {
    const count = await this.inswitchRepo.countBy({ user_id: user.id });
    if (count > 0) {
      return;
    }
    const entityId = await this.api.createEntity();
    const walletId = await this.api.createWallet(entityId);
    await this.inswitchRepo.insert(
      this.inswitchRepo.create({ user_id: user.id, entity_id: Number(entityId), wallet_id: Number(walletId) }),
    );
  }
}
