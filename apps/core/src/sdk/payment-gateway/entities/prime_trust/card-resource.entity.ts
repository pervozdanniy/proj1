import { ContributionEntity } from '@/sdk/payment-gateway/entities/prime_trust/contribution.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PrimeTrustContactEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/prime-trust-contact.entity';

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

  @OneToMany(() => ContributionEntity, (c) => c.cardResource)
  contributions?: ContributionEntity[];
}
