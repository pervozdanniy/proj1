// NPM Modules
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('payment_gateways')
export class PaymentGatewayEntity {
  @PrimaryColumn('integer')
  id: number;

  @Column('varchar')
  name: string;

  @Column('varchar')
  alias: string;
}
