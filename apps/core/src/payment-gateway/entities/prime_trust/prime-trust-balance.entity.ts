import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { PrimeTrustAccountEntity } from '~svc/core/src/payment-gateway/entities/prime_trust/prime-trust-account.entity';

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

  @OneToOne(() => PrimeTrustAccountEntity)
  @JoinColumn({ name: 'user_id' })
  account?: PrimeTrustAccountEntity;
}
