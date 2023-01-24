import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { ContributionEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/contribution.entity';
import { PrimeTrustAccountEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-account.entity';
import { PrimeTrustKycDocumentEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-kyc-document.entity';
import { WithdrawalParamsEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/withdrawal-params.entity';
import { UserEntity } from '~svc/core/src/user/entities/user.entity';

@Entity('prime_trust_contacts')
export class PrimeTrustContactEntity {
  @PrimaryColumn('integer', { generated: false })
  user_id: number;

  @Column('integer')
  account_id: number;

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

  @OneToMany(() => PrimeTrustKycDocumentEntity, (document) => document.contact)
  @JoinColumn({ name: 'user_id' })
  documents?: PrimeTrustKycDocumentEntity[];

  @OneToMany(() => WithdrawalParamsEntity, (params) => params.contact)
  withdrawalParams?: WithdrawalParamsEntity[];

  @OneToMany(() => ContributionEntity, (params) => params.contact)
  contributions?: ContributionEntity[];

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  skopa_user?: UserEntity;

  @ManyToOne(() => PrimeTrustAccountEntity)
  @JoinColumn({ name: 'account_id' })
  account?: PrimeTrustAccountEntity;
}
