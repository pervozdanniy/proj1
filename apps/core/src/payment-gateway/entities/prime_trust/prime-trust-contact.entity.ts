import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { PrimeTrustAccountEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-account.entity';
import { PrimeTrustKycDocumentEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-kyc-document.entity';

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

  @OneToMany(() => PrimeTrustKycDocumentEntity, (document) => document.contact)
  @JoinColumn({ name: 'user_id' })
  documents?: PrimeTrustKycDocumentEntity[];
}
