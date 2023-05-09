import { Column, Entity, PrimaryColumn } from 'typeorm';

export enum CardType {
  Virtual,
  Physical,
}

@Entity('inswitch_card')
export class InswitchCardEntity {
  @PrimaryColumn({ generated: false, type: 'uuid' })
  id: string;

  @Column('integer')
  account_id: number;

  @Column('smallint')
  type: CardType;

  @Column('char', { length: 3 })
  currency: string;

  @Column('varchar', { length: 20 })
  pan: string;

  @Column('varchar', { length: 50 })
  payment_method_ref: string;
}
