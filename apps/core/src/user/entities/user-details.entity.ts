import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { SendType } from '~common/constants/user';
import { UserEntity } from './user.entity';

@Entity('user_details')
export class UserDetailsEntity {
  @PrimaryColumn('integer', { generated: false })
  user_id: number;

  @Column('character varying', { length: 50, nullable: true })
  first_name: string;

  @Column('character varying', { length: 50, nullable: true })
  last_name: string;

  @Column('character varying', { length: 50, nullable: true })
  city: string;

  @Column('character varying', { length: 50, nullable: true })
  street: string;

  @Column('character varying', { length: 50, nullable: true })
  region: string;

  @Column('varchar', { length: 50, nullable: true })
  date_of_birth: string;

  @Column({
    type: 'integer',
    default: SendType.EMAIL,
  })
  send_type: SendType;

  @Column('integer', { nullable: true })
  postal_code: number;

  @Column('integer', { nullable: true })
  tax_id_number: number;

  @Column('varchar', { nullable: true })
  avatar?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;
}
