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
import { PrimeTrustUserEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-user.entity';
import { CountryEntity } from '~svc/core/src/user/entities/country.entity';
import { UserDetailsEntity } from '~svc/core/src/user/entities/user-details.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('character varying')
  username: string;

  @Column('character varying')
  email: string;

  @Column('integer')
  country_id: number;

  @Column('character varying', { nullable: true })
  phone?: string;

  @Column('character varying')
  status: string;

  @Column('character varying')
  password?: string;

  @Column('timestamp', { nullable: true })
  email_verified_at?: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => CountryEntity, (country) => country.users)
  @JoinColumn({ name: 'country_id' })
  country?: CountryEntity;

  @OneToOne(() => UserDetailsEntity, (details) => details.user)
  details?: UserDetailsEntity;

  @OneToOne(() => PrimeTrustUserEntity, (prime) => prime.skopa_user)
  prime_user?: PrimeTrustUserEntity;
}
