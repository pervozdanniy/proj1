import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { PrimeTrustContactEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-contact.entity';

@Entity('prime_kyc_documents')
export class PrimeTrustKycDocumentEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('integer')
  user_id: number;

  @Column('character varying')
  uuid: string;

  @Column('character varying', { nullable: true })
  label: string;

  @Column('character varying')
  status: string;

  @Column('character varying', { nullable: true })
  kyc_check_uuid: string;

  @Column('character varying', { nullable: true })
  failure_details?: string;

  @Column('character varying')
  file_url: string;

  @Column('character varying')
  extension: string;

  @ManyToOne(() => PrimeTrustContactEntity)
  @JoinColumn({ name: 'user_id' })
  contact: PrimeTrustContactEntity;
}
