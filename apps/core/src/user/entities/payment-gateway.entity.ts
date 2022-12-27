import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('payment_gateways')
export class PaymentGatewayEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('varchar', { length: 255 })
  name: string;

  @Column('varchar', { length: 255 })
  alias: string;
}
