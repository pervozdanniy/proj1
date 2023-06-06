import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum LiquidoAuthorizationStatus {
  Pending,
  Processing,
  Processed,
}

@Entity('liquido_withdraw_authorization')
export class LiquidoWithdrawAuthorizationEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('integer')
  transfer_id: number;

  @Column('double precision', { nullable: true })
  amount: number;

  @Column('double precision', { nullable: true })
  amount_usd: number;

  @Column('char', { length: 3 })
  currency: string;

  @Column('smallint')
  status: LiquidoAuthorizationStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
