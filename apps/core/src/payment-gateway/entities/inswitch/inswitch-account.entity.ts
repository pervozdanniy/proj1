import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('inswitch_account')
export class InswitchAccountEntity {
  @PrimaryColumn({ generated: false })
  user_id: number;

  @Column('integer')
  entity_id: number;

  @Column('integer', { nullable: true })
  wallet_id?: number;

  @Column('varchar', { nullable: true })
  payment_reference?: string;
}
