import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PrimeTrustContactEntity } from './prime_trust/prime-trust-contact.entity';

@Entity('transfers')
export class TransfersEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('integer')
  user_id: number;

  @Column('integer', { nullable: true })
  receiver_id: number;

  @Column('character varying', { length: 50, nullable: true })
  uuid: string;

  @Column('integer', { nullable: true })
  param_id: number;

  @Column('character varying', { length: 50, nullable: true })
  param_type: string;

  @Column('character varying', { length: 50, nullable: true })
  type: string;

  @Column('character varying', { length: 50, nullable: true })
  provider: string;

  @Column('double precision', { nullable: true })
  amount: number;

  @Column('double precision', { nullable: true })
  fee: number;

  @Column('character varying', { length: 50, nullable: true })
  currency_type: string;

  @Column('character varying', { length: 50, nullable: true })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => PrimeTrustContactEntity, (contact) => contact.transferFunds, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  contact?: PrimeTrustContactEntity;
}
