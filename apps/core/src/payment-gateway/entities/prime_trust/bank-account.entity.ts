import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AchCheckType, BankAccountTypes } from '~common/enum/document-types.enum';
import { PrimeTrustContactEntity } from './prime-trust-contact.entity';

@Entity('bank_accounts')
export class BankAccountEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('integer')
  user_id: number;

  @Column('character varying', { length: 50, nullable: true })
  country: string;

  @Column('character varying', { length: 50, nullable: true })
  bank_code: string;

  @Column('character varying', { length: 50, nullable: true })
  account_uuid: string;

  @Column('character varying', { length: 50, nullable: true })
  account: string;

  @Column('character varying', { length: 50, nullable: true })
  bank_account_name: string;

  @Column('character varying', { length: 50, nullable: true })
  bank_account_number: string;

  @Column({
    type: 'enum',
    enum: BankAccountTypes,
    default: BankAccountTypes.CHECKING,
  })
  type: BankAccountTypes;

  @Column({
    type: 'enum',
    enum: AchCheckType,
    default: AchCheckType.PERSONAL,
  })
  ach_check_type: AchCheckType;

  @Column('character varying', { length: 50, nullable: true })
  routing_number: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => PrimeTrustContactEntity, (contact) => contact.bank_accounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  contact?: PrimeTrustContactEntity;
}
