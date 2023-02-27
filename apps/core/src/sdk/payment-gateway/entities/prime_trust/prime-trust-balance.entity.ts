import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { PrimeTrustContactEntity } from './prime-trust-contact.entity';

@Entity('prime_trust_balance')
export class PrimeTrustBalanceEntity {
  @PrimaryColumn('integer', { generated: false })
  user_id: number;

  @Column('float', { default: 0 })
  settled: string;

  @Column('character varying')
  currency_type: string;

  @OneToOne(() => PrimeTrustContactEntity)
  @JoinColumn({ name: 'user_id' })
  contact?: PrimeTrustContactEntity;
}
