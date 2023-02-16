import { PaymentGatewayEntity } from '@/sdk/payment-gateway/entities/payment-gateway.entity';
import { UserEntity } from '@/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('countries')
export class CountryEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('varchar', { length: 255 })
  code: string;

  @Column('varchar', { length: 255 })
  name: string;

  @Column('integer')
  payment_gateway_id: number;

  @ManyToOne(() => PaymentGatewayEntity)
  @JoinColumn({ name: 'payment_gateway_id' })
  payment_gateway?: PaymentGatewayEntity;

  @OneToMany(() => UserEntity, (user) => user.country)
  users?: UserEntity[];
}
