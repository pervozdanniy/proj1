import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '~svc/core/src/user/entities/user.entity';

@Entity('user_details')
export class UserDetailsEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('character varying')
  first_name: string;

  @Column('character varying')
  last_name: string;

  @Column('character varying')
  city: string;

  @Column('character varying')
  street: string;

  @Column('character varying')
  region: string;

  @Column('integer')
  user_id: number;

  @Column('date')
  date_of_birth: Date;

  @Column('integer')
  postal_code: number;

  @Column('integer')
  tax_id_number: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;
}
