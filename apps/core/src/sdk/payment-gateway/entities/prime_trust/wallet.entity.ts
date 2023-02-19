import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WalletFor } from '~common/enum/document-types.enum';
import { PrimeTrustContactEntity } from './prime-trust-contact.entity';

@Entity('wallets')
export class WalletEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('integer')
  user_id: number;

  @Column('character varying', { nullable: true })
  label: string;

  @Column('character varying', { nullable: true })
  asset_transfer_method_id: string;

  @Column('character varying', { nullable: true })
  wallet_address: string;

  @Column({
    type: 'enum',
    enum: WalletFor,
    default: WalletFor.DEPOSIT,
  })
  wallet_for: WalletFor;

  @Column('character varying', { nullable: true })
  asset_id: string;

  @Column('character varying', { nullable: true })
  asset_type: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => PrimeTrustContactEntity, (contact) => contact.bank_accounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  contact?: PrimeTrustContactEntity;
}
