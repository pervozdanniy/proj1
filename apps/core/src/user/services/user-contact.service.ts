import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { UserContactEntity } from '../entities/user-contact.entity';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserContactService {
  constructor(
    @InjectRepository(UserContactEntity)
    private readonly userContactRepository: Repository<UserContactEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async update(user: UserEntity, contacts: { new?: string[]; removed?: string[] }) {
    let addSql: string | undefined;
    const addParams = [];
    if (contacts.new?.length) {
      let cte = 'VALUES ';
      let index = 0;
      contacts.new.forEach((phone) => {
        cte += `($${++index}),`;
        addParams.push(phone);
      });
      cte = cte.substring(0, cte.length - 1);

      addSql = `WITH contacts (phone) AS (${cte})
            INSERT INTO user_contact (user_id, phone, contact_id)
            SELECT $${++index}, c.phone, u.id
            FROM contacts c
            LEFT JOIN users u ON u.phone = c.phone
            ON CONFLICT DO NOTHING`;
      addParams.push(user.id);
    }

    await this.dataSource.transaction(async (tm) => {
      const usRepo = tm.getRepository(UserContactEntity);
      if (user.phone) await usRepo.update({ phone: user.phone }, { contact_id: user.id });
      if (contacts.removed?.length) await usRepo.delete({ user_id: user.id, phone: In(contacts.removed) });
      if (addSql) await tm.query(addSql, addParams);
    });
  }

  async detouch(userId: number) {
    await this.userContactRepository.delete({ contact_id: userId });
  }

  list(userId: number) {
    return this.userContactRepository
      .createQueryBuilder()
      .select()
      .leftJoinAndSelect('user', 'u')
      .where({ user_id: userId })
      .getMany();
  }
}
