import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { PrimeTrustContactEntity } from '~svc/core/src/sdk/payment-gateway/entities/prime_trust/prime-trust-contact.entity';
import { UserEntity } from '~svc/core/src/user/entities/user.entity';

@Entity('prime_trust_accounts')
export class PrimeTrustAccountEntity {
  @PrimaryColumn('integer', { generated: false })
  user_id: number;

  @Column('varchar', { length: 50, nullable: true })
  name?: string;

  @Column('varchar', { length: 50, nullable: true })
  uuid?: string;

  @Column('varchar', { length: 50, nullable: true })
  number?: string;

  @Column('boolean', { nullable: true })
  contributions_frozen?: boolean;

  @Column('boolean', { nullable: true })
  disbursements_frozen?: boolean;

  @Column('boolean', { nullable: true })
  statements?: boolean;

  @Column('boolean', { nullable: true })
  solid_freeze?: boolean;

  @Column('varchar', { length: 50, nullable: true })
  status?: string;

  @Column('varchar', { length: 50, nullable: true })
  offline_cold_storage?: string;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  skopa_user?: UserEntity;

  @OneToOne(() => PrimeTrustContactEntity, (contact) => contact.account)
  contact?: PrimeTrustContactEntity;
}
