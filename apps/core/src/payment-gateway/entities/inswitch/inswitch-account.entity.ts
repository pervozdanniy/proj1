import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('inswitch_account')
export class InswitchAccountEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('integer')
  user_id: number;

  @Column('char', { length: 2 })
  country: string;

  @Column('varchar', { length: 32 })
  entity_id: string;

  @Column('varchar', { length: 32, nullable: true })
  wallet_id?: string;

  @Column('varchar', { nullable: true })
  payment_reference?: string;
}
