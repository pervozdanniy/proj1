import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

export enum InswitchAuthorizationStatus {
  Pending,
  Approved,
}

@Entity('inswitch_withdraw_authorization')
export class InswitchWithdrawAuthorizationEntity {
  @PrimaryColumn({ type: 'varchar', generated: false, length: 64 })
  id: string;

  @Column('decimal')
  amount: number;

  @Column('char', { length: 3 })
  currency: string;

  @Column('smallint')
  status: InswitchAuthorizationStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column('timestamp', { nullable: true })
  transferred_at?: Date;

  @Column('varchar', { length: 32 })
  entity_id: string;
}
