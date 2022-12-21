import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PrimeTrustContactEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-contact.entity';

@Entity('prime_kyc_documents')
export class PrimeTrustKycDocumentEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('character varying')
  uuid: string;

  @Column('integer')
  contact_id: number;

  @Column('character varying')
  label: string;

  @Column('character varying')
  status: string;

  @Column('character varying')
  kyc_check_uuid: string;

  @Column('character varying')
  file_url: string;

  @Column('character varying')
  extension: string;

  @ManyToOne(() => PrimeTrustContactEntity)
  @JoinColumn({ name: 'contact_id' })
  contact: PrimeTrustContactEntity;
}
