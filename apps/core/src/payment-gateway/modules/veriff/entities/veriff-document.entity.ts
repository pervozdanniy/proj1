import { UserEntity } from '@/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type KYCDocumentType = 'PASSPORT' | 'ID_CARD' | 'RESIDENCE_PERMIT' | 'DRIVERS_LICENSE' | 'OTHER';

export type KYCStatus = 'approved' | 'resubmission_requested' | 'declined' | 'expired' | 'abandoned' | 'review';

@Entity('veriff_kyc_documents')
export class VeriffDocumentEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('integer')
  user_id: number;

  @Column('character varying', { unique: true })
  session_id: string;

  @Column('character varying', { unique: true, nullable: true })
  attempt_id?: string;

  @Column('character varying', { nullable: true })
  issuing_date?: string;

  @Column('character varying', { nullable: true })
  expiration_date?: string;

  @Column('character varying', { nullable: true })
  document_number?: string;

  @Column('character varying', { nullable: true })
  label?: KYCDocumentType;

  @Column('character varying', { nullable: true })
  document_front?: string;

  @Column('character varying', { nullable: true })
  document_back?: string;

  @Column('character varying', { nullable: true })
  profile_image?: string;

  @Column('character varying')
  status: KYCStatus;

  @Column('character varying', { nullable: true })
  failure_details?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column('char', { length: 2 })
  country: string;

  @Column('character varying', { nullable: true })
  person_id_number?: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
