import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { PrimeTrustContactEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-contact.entity';

@Entity('prime_trust_balance')
export class PrimeTrustBalanceEntity {
  @PrimaryColumn('integer', { generated: false })
  user_id: number;

  @Column('float', { default: 0 })
  settled: string;

  @Column('float', { default: 0 })
  disbursable: string;

  @Column('float', { default: 0 })
  pending_transfer: string;

  @Column('character varying')
  currency_type: string;

  @Column('float', { default: 0 })
  contingent_hold: string;

  @Column('float', { default: 0 })
  non_contingent_hold: string;

  @OneToOne(() => PrimeTrustContactEntity)
  @JoinColumn({ name: 'user_id' })
  contact?: PrimeTrustContactEntity;
}
