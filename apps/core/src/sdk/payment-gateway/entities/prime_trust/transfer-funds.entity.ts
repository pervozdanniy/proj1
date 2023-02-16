import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PrimeTrustContactEntity } from './prime-trust-contact.entity';

@Entity('transfer_funds')
export class TransferFundsEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('integer')
  sender_id: number;

  @Column('integer')
  receiver_id: number;

  @Column('character varying', { length: 50, nullable: false })
  uuid: string;

  @Column('character varying', { length: 50, nullable: true })
  amount: string;

  @Column('character varying', { length: 50, nullable: true })
  fee_amount: string;

  @Column('character varying', { length: 50, nullable: true })
  total_amount: string;

  @Column('character varying', { length: 50, nullable: true })
  unit_count: string;

  @Column('character varying', { length: 50, nullable: true })
  currency_type: string;

  @Column('character varying', { length: 50, nullable: true })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => PrimeTrustContactEntity, (contact) => contact.transferFunds, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  contact?: PrimeTrustContactEntity;
}
