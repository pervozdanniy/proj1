import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from '~svc/core/src/user/entities/user.entity';

@Entity('prime_trust_users')
export class PrimeTrustUserEntity {
  @PrimaryColumn('integer', { generated: false })
  user_id: number;

  @Column('varchar', { length: 255 })
  password: string;

  @Column('boolean', { nullable: true })
  disabled?: boolean;

  @Column('varchar', { length: 255, nullable: true })
  uuid?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  skopa_user: UserEntity;

  @Column('varchar', { length: 255, default: 'pending' })
  status: string;
}
