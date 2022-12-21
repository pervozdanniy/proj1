import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { PaymentGatewayEntity } from '~svc/core/src/payment-gateway/entities/payment-gateway.entity';
import { UserEntity } from '~svc/core/src/user/entities/user.entity';

@Entity('countries')
export class CountryEntity {
  @PrimaryColumn('integer')
  id: number;

  @Column('varchar', { length: 100 })
  code: string;

  @Column('varchar', { length: 100 })
  name: string;

  @Column('integer')
  payment_gateway_id: number;

  @ManyToOne(() => PaymentGatewayEntity)
  @JoinColumn({ name: 'payment_gateway_id' })
  payment_gateway: PaymentGatewayEntity;

  @OneToMany(() => UserEntity, (user) => user.country)
  users: UserEntity[];
}
