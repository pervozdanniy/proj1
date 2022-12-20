import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PrimeTrustAccountEntity } from '~svc/core/src/user/entities/prime-trust-account.entity';

@Entity('prime_trust_contacts')
export class PrimeTrustContactEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('character varying')
  uuid: string;

  @Column('integer')
  account_id: number;

  @Column('character varying')
  first_name: string;

  @Column('character varying')
  middle_name: string;

  @Column('character varying')
  last_name: string;

  @Column('boolean')
  identity_confirmed: boolean;

  @Column('character varying')
  identity_fingerprint: string;

  @Column('boolean')
  proof_of_address_documents_verified: boolean;

  @Column('boolean')
  identity_documents_verified: boolean;

  @Column('boolean')
  aml_cleared: boolean;

  @Column('boolean')
  cip_cleared: boolean;

  @OneToOne(() => PrimeTrustAccountEntity)
  @JoinColumn({ name: 'account_id' })
  user: PrimeTrustAccountEntity;
}
