import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('user_contact')
export class UserContactEntity {
  @PrimaryColumn('int')
  user_id: number;

  @PrimaryColumn('varchar', { length: 20 })
  phone: string;

  @Column('int', { nullable: true })
  contact_id?: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'contact_id' })
  contact?: UserEntity;
}
