import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PrimeTrustContactEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/prime-trust-contact.entity';

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
  currency_type: string;

  @Column('character varying', { length: 50, nullable: true })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => PrimeTrustContactEntity, (contact) => contact.withdrawalParams, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  contact?: PrimeTrustContactEntity;
}
