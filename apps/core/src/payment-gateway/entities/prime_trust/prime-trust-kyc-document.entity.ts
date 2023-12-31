import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column('character varying', { nullable: true })
  file_url: string;

  @Column('character varying', { nullable: true })
  extension: string;
}
