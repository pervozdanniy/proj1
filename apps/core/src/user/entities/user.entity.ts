import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '~command/interfaces/user.interface';

@Entity('users')
export class UserEntity implements User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('character varying', { length: 200 })
  name: string;

  @Column('character varying', { length: 100 })
  email: string;

  @Column('character varying', { length: 50 })
  phone: string;

  @Column('character varying', { length: 200, select: false })
  password?: string;

  @Column('timestamp')
  email_verified_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date;
}
