import { Column, Entity, PrimaryColumn } from 'typeorm';

export enum CardType {
  Virtual,
  Physical,
}

export enum CardStatus {
  Created = 'created',
  Ordered = 'ordered',
  Assigned = 'assigned',
  Active = 'active',
  Blocked = 'blocked',
  Cancelled = 'cancelled',
}

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

  @Column('boolean', { default: false })
  is_active: boolean;

  get isVirtual() {
    return this.type === CardType.Virtual;
  }
}
