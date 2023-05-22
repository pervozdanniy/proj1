import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum DepositResourceType {
  Bank,
  Card,
}

@Entity('deposit_flow')
export class DepositFlowEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int' })
  user_id: number;

  @Column({ type: 'decimal' })
  amount: number;

  @Column({ type: 'char', length: 3 })
  currency: string;

  @Column({ type: 'char', length: 2 })
  country_code: string;

  @Column({ type: 'smallint' })
  resource_type: DepositResourceType;
}
