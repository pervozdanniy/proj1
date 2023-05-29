import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PrimeTrustContactEntity } from './prime_trust/prime-trust-contact.entity';

export enum TransferTypes {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
}

export enum PaymentTypes {
  BANK = 'bank',
  CASH = 'cash',
}
export enum ParamsTypes {
  WITHDRAWAL = 'withdrawal_param',
}

export enum TransferStatus {
  PENDING = 'pending',
  FAILED = 'failed',
  IDENTIFIED = 'identified',
  DELIVERED = 'delivered',
  SETTLED = 'settled',
  EXECUTED = 'executed',
}

@Entity('transfers')
export class TransfersEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('integer')
  user_id: number;

  @Column('integer', { nullable: true })
  receiver_id: number;

  @Column('character varying', { length: 50, nullable: true })
  uuid: string;

  @Column('integer', { nullable: true })
  param_id: number;

  @Column('character varying', { length: 50, nullable: true })
  param_type: ParamsTypes;

  @Column('character varying', { length: 50, nullable: true })
  type: TransferTypes;

  @Column('character varying', { length: 50, nullable: true })
  payment_type: PaymentTypes;

  @Column('character varying', { length: 50, nullable: true })
  provider: string;

  @Column('double precision', { nullable: true })
  amount: number;

  @Column('double precision', { nullable: true })
  amount_usd: number;

  @Column('double precision', { nullable: true })
  fee: number;

  @Column('character varying', { length: 50, nullable: true })
  currency_type: string;

  @Column('character varying', { length: 50, nullable: true })
  status: TransferStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => PrimeTrustContactEntity, (contact) => contact.transferFunds, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  contact?: PrimeTrustContactEntity;
}
