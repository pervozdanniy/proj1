import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '~svc/core/src/user/entities/user.entity';
import { PrimeTrustUserEntity } from '~svc/core/src/user/entities/prime.trust.user.entity';

@Entity('prime_trust_accounts')
export class PrimeTrustAccountEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('character varying')
  name: string;

  @Column('character varying')
  uuid: string;

  @Column('integer')
  user_id: number;

  @Column('character varying')
  number: string;

  @Column('boolean')
  contributions_frozen: boolean;

  @Column('boolean')
  disbursements_frozen: boolean;

  @Column('boolean')
  statements: boolean;

  @Column('boolean')
  solid_freeze: boolean;

  @Column('character varying')
  status: string;

  @Column('character varying')
  offline_cold_storage: string;

  @OneToOne(() => PrimeTrustUserEntity)
  @JoinColumn({ name: 'user_id' })
  user: PrimeTrustUserEntity;
}
