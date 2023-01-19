import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TwoFactorMethod, TwoFactorSettingsEntity } from '../../entities/2fa_settings.entity';
import { BaseSettingsDto } from '../dto/2fa.dto';

@Injectable()
export class TwoFactorService {
  constructor(
    @InjectRepository(TwoFactorSettingsEntity) private readonly settingsRepo: Repository<TwoFactorSettingsEntity>,
  ) {}

  async getEnabled(userId: number) {
    const entities = await this.settingsRepo.find({ select: ['method'], where: { user_id: userId } });

    return entities.map((e) => e.method);
  }

  generateCode() {
    return Math.floor(100000 + Math.random() * 899999);
  }

  enable(settings: BaseSettingsDto, userId: number) {
    return this.settingsRepo.upsert({ user_id: userId, method: settings.method, destination: settings.destination }, [
      'user_id',
      'method',
    ]);
  }

  disable(userId: number, method?: TwoFactorMethod) {
    const qb = this.settingsRepo.createQueryBuilder('s').delete().where({ user_id: userId });
    if (method) {
      qb.andWhere(':method & s.method = s.method', { method });
    }

    return qb.execute();
  }
}
