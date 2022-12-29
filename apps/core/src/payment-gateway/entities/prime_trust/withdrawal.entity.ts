import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WithdrawalParamsEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/withdrawal-params.entity';

@Entity('withdrawals')
export class WithdrawalEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('integer')
  user_id: number;

  @Column('character varying', { length: 50, nullable: true })
  uuid: string;

  @Column('integer')
  params_id: number;

  @Column('character varying', { length: 50, nullable: true })
  amount: string;

  @Column('character varying', { length: 50, nullable: true })
  status: string;

  @Column('character varying', { length: 50, nullable: true })
  currency_type: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => WithdrawalParamsEntity, (p) => p.withdrawals)
  @JoinColumn({ name: 'params_id' })
  params?: WithdrawalParamsEntity;
}
