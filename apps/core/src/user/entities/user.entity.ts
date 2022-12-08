import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('character varying')
  username: string;

  @Column('character varying')
  email: string;

  @Column('character varying', { nullable: true })
  phone: string;

  @Column('character varying', { select: false })
  password?: string;

  @Column('timestamp', { nullable: true })
  email_verified_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
