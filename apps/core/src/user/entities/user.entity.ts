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
import { CountryEntity } from '../../country/entities/country.entity';
import { NotificationEntity } from '../../notification/entities/notification.entity';
import { UserDetailsEntity } from './user-details.entity';

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

  @Column('varchar', { unique: true })
  phone: string;

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

  @OneToMany(() => NotificationEntity, (n) => n.user)
  notifications?: NotificationEntity[];

  @ManyToMany(() => UserEntity, (user) => user.contacts, { createForeignKeyConstraints: false })
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
    synchronize: false,
  })
  contacts?: UserEntity[];
}
