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

@Entity('withdrawal_params')
export class WithdrawalParamsEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('integer')
  user_id: number;

  @Column('character varying', { length: 50, nullable: true })
  uuid: string;

  @Column('integer', { nullable: true })
  bank_account_id: number;

  @Column('character varying', { length: 50, nullable: true })
  funds_transfer_type: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => PrimeTrustContactEntity, (contact) => contact.withdrawalParams, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  contact?: PrimeTrustContactEntity;
}
