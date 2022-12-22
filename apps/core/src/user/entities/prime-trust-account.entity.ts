import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { PrimeTrustUserEntity } from '~svc/core/src/user/entities/prime-trust-user.entity';
import { UserEntity } from './user.entity';

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

  @OneToOne(() => PrimeTrustUserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  user?: PrimeTrustUserEntity;

  @OneToOne(() => UserEntity, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'user_id' })
  skopa_user?: UserEntity;
}
