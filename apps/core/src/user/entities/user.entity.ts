import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CountryEntity } from '~svc/core/src/user/entities/country.entity';
import { PrimeTrustUserEntity } from '~svc/core/src/user/entities/prime-trust-user.entity';
import { UserDetailsEntity } from '~svc/core/src/user/entities/user-details.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('varchar')
  username: string;

  @Column('varchar', { unique: true })
  email: string;

  @Column('integer')
  country_id: number;

  @Column('varchar', { nullable: true })
  phone?: string;

  @Column('varchar', { default: 'active' })
  status: string;

  @Column('varchar')
  password?: string;

  @Column('timestamp', { nullable: true })
  email_verified_at?: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => CountryEntity, (country) => country.users, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'country_id' })
  country?: CountryEntity;

  @OneToOne(() => UserDetailsEntity, (details) => details.user)
  details?: UserDetailsEntity;

  @OneToOne(() => PrimeTrustUserEntity, (prime) => prime.skopa_user)
  prime_user?: PrimeTrustUserEntity;
}
