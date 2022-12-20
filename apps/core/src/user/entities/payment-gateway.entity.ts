// NPM Modules
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('payment_gateways')
export class PaymentGatewayEntity {
  @PrimaryColumn('integer')
  id: number;

  @Column('varchar')
  name: string;

  @Column('varchar')
  alias: string;
}
