import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PrimeTrustContactEntity } from './prime-trust-contact.entity';

@Entity('card_resource')
export class CardResourceEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('integer')
  user_id: number;

  @Column('character varying', { length: 50, nullable: false })
  uuid: string;

  @Column('character varying', { length: 50, nullable: true })
  transfer_method_id: string;

  @Column('character varying', { length: 50, nullable: true })
  credit_card_bin: string;

  @Column('character varying', { length: 50, nullable: true })
  credit_card_name: string;

  @Column('character varying', { length: 50, nullable: true })
  credit_card_type: string;

  @Column('character varying', { length: 50, nullable: true })
  credit_card_expiration_date: string;

  @Column('character varying', { length: 50, nullable: true })
  status: string;

  @Column('character varying', { length: 50, nullable: true })
  token: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => PrimeTrustContactEntity, (contact) => contact.withdrawalParams, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  contact?: PrimeTrustContactEntity;
}
