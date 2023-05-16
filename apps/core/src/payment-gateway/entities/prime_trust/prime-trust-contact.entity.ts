import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { TransfersEntity } from '../transfers.entity';
import { BankAccountEntity } from './bank-account.entity';
import { PrimeTrustAccountEntity } from './prime-trust-account.entity';
import { WithdrawalParamsEntity } from './withdrawal-params.entity';

@Entity('prime_trust_contacts')
export class PrimeTrustContactEntity {
  @PrimaryColumn('integer', { generated: false })
  user_id: number;

  @Column('character varying')
  uuid: string;

  @Column('character varying')
  first_name: string;

  @Column('character varying', { nullable: true })
  middle_name: string;

  @Column('character varying')
  last_name: string;

  @Column('boolean', { default: false })
  identity_confirmed: boolean;

  @Column('character varying', { default: false })
  identity_fingerprint: string;

  @Column('boolean', { default: false })
  proof_of_address_documents_verified: boolean;

  @Column('boolean', { default: false })
  identity_documents_verified: boolean;

  @Column('boolean', { default: false })
  aml_cleared: boolean;

  @Column('boolean', { default: false })
  cip_cleared: boolean;

  @OneToOne(() => PrimeTrustAccountEntity)
  @JoinColumn({ name: 'user_id' })
  account?: PrimeTrustAccountEntity;

  @OneToMany(() => WithdrawalParamsEntity, (params) => params.contact)
  withdrawalParams?: WithdrawalParamsEntity[];

  @OneToMany(() => TransfersEntity, (params) => params.contact)
  transferFunds?: TransfersEntity[];

  @OneToMany(() => BankAccountEntity, (params) => params.contact)
  bank_accounts?: BankAccountEntity[];
}
