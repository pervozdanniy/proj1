import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

export enum InswitchAuthorizationStatus {
  Pending,
  Approved,
  Processing,
  Processed,
}

@Entity('inswitch_withdraw_authorization')
export class InswitchWithdrawAuthorizationEntity {
  @PrimaryColumn({ type: 'varchar', generated: false, length: 64 })
  id: string;

  @Column('varchar', { length: 32 })
  entity_id: string;

  @Column('decimal')
  amount: string;

  @Column('char', { length: 3 })
  currency: string;

  @Column('decimal')
  amount_usd: string;

  @Column('decimal')
  fee_usd: string;

  @Column('smallint')
  status: InswitchAuthorizationStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
