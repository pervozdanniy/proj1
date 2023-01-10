import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('user_contact')
export class UserContactEntity {
  @PrimaryColumn('int')
  user_id: number;

  @PrimaryColumn('varchar', { length: 20 })
  phone: string;

  @Column('int', { nullable: true })
  contact_id?: number;
}
