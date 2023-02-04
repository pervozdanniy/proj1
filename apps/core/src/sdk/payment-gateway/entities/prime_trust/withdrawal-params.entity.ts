import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserDetailsEntity } from '~svc/core/src/api/user/entities/user-details.entity';
import { BankAccountEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/bank-account.entity';
import { PrimeTrustContactEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/prime-trust-contact.entity';
import { WithdrawalEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/withdrawal.entity';

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

  @OneToMany(() => WithdrawalEntity, (w) => w.params)
  withdrawals?: WithdrawalEntity[];
}
