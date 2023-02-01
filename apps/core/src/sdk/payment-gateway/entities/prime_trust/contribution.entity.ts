import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PrimeTrustContactEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/prime-trust-contact.entity';

@Entity('contributions')
export class ContributionEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('integer')
  user_id: number;

  @Column('character varying', { length: 50, nullable: true })
  uuid: string;

  @Column('character varying', { length: 50, nullable: true })
  currency_type: string;

  @Column('character varying', { length: 50, nullable: true })
  amount: string;

  @Column('character varying', { length: 50, nullable: true })
  contributor_email: string;

  @Column('character varying', { length: 50, nullable: true })
  contributor_name: string;

  @Column('character varying', { length: 50, nullable: true })
  funds_transfer_type: string;

  @Column('character varying', { length: 50, nullable: true })
  reference: string;

  @Column('character varying', { length: 50, nullable: true })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => PrimeTrustContactEntity, (contact) => contact.withdrawalParams, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  contact?: PrimeTrustContactEntity;
}
