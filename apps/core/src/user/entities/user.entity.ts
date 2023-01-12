import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserSourceEnum } from '~common/constants/user';
import { CountryEntity } from '~svc/core/src/country/entities/country.entity';
import { NotificationEntity } from '~svc/core/src/notification/entities/notification.entity';
import { PrimeTrustUserEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-user.entity';
import { UserDetailsEntity } from '~svc/core/src/user/entities/user-details.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('varchar')
  username: string;

  @Column('varchar', { unique: true })
  email: string;

  @Column('integer', { nullable: true })
  country_id?: number;

  @Column('varchar', { nullable: true })
  phone?: string;

  @Column('varchar', { default: 'active' })
  status: string;

  @Column('varchar', { nullable: true })
  password?: string;

  @Column('timestamp', { nullable: true })
  email_verified_at?: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column('varchar', { length: 50, default: UserSourceEnum.Api })
  source: UserSourceEnum;

  @ManyToOne(() => CountryEntity, (country) => country.users, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'country_id' })
  country?: CountryEntity;

  @OneToOne(() => UserDetailsEntity, (details) => details.user)
  details?: UserDetailsEntity;

  @OneToOne(() => PrimeTrustUserEntity, (prime) => prime.skopa_user)
  prime_user?: PrimeTrustUserEntity;

  @OneToMany(() => NotificationEntity, (n) => n.user)
  notifications?: NotificationEntity[];

  @ManyToMany(() => UserEntity, (user) => user.contacts)
  @JoinTable({
    name: 'user_contact',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'contact_id',
      referencedColumnName: 'id',
    },
  })
  contacts?: UserEntity[];
}
