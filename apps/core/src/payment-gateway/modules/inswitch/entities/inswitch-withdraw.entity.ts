import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum InswitchWithdrawStatus {
  Pending,
  Processed,
}

@Entity('inswitch_withdraw_entity')
export class InswitchWithdrawEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('decimal')
  amount: number;

  @Column('smallint')
  status: InswitchWithdrawStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
