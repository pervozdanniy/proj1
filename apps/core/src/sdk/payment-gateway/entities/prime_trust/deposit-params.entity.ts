import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ContributionEntity } from './contribution.entity';

@Entity('deposit_params')
export class DepositParamsEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('integer')
  user_id: number;

  @Column('character varying', { length: 50, nullable: true })
  uuid: string;

  @Column('integer', { nullable: true })
  bank_account_id: number;

  @Column('character varying', { length: 50, nullable: true })
  funds_transfer_type: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => ContributionEntity, (c) => c.depositParams)
  contributions?: ContributionEntity[];
}
