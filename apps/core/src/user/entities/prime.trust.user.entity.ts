import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '~svc/core/src/user/entities/user.entity';
import { IsBoolean } from 'class-validator';

@Entity('prime_trust_users')
export class PrimeTrustUserEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('character varying')
  name: string;

  @Column('character varying')
  email: string;

  @Column('integer')
  user_id: number;

  @Column('character varying', { select: false })
  password: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column('boolean')
  disabled: boolean;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  skopa_user: UserEntity;
}
