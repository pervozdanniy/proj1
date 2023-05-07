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

@Entity('socure_kyc_documents')
export class SocureDocumentEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('integer')
  user_id: number;

  @Column('character varying', { unique: true })
  uuid: string;

  @Column('character varying', { nullable: true })
  issuing_date: string;

  @Column('character varying', { nullable: true })
  expiration_date: string;

  @Column('character varying', { nullable: true })
  document_number: string;

  @Column('character varying', { nullable: true })
  label: string;

  @Column('character varying', { nullable: true })
  documentfront: string;

  @Column('character varying', { nullable: true })
  documentback: string;

  @Column('character varying', { nullable: true })
  profileimage: string;

  @Column('character varying')
  status: string;

  @Column('character varying', { nullable: true })
  failure_details?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
