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

@Entity('prime_trust_users')
export class PrimeTrustUserEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('integer')
  user_id: number;

  @Column('character varying')
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

  @Column('character varying')
  status: string;

  @Column('character varying')
  uuid: string;
}
