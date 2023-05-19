import { Column, Entity, PrimaryColumn } from 'typeorm';

export enum CardType {
  Virtual,
  Physical,
}

export type CardStatus = 'created' | 'ordered' | 'assigned' | 'active' | 'blocked' | 'cancelled';

@Entity('inswitch_card')
export class InswitchCardEntity {
  @PrimaryColumn({ generated: false, type: 'uuid' })
  reference: string;

  @Column('integer')
  account_id: number;

  @Column('smallint')
  type: CardType;

  @Column('varchar', { length: 16 })
  status: CardStatus;

  @Column('char', { length: 3 })
  currency: string;

  @Column('varchar', { length: 20, nullable: true })
  pan?: string;

  get isVirtual() {
    return this.type === CardType.Virtual;
  }
}
