import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PaymentGatewayEntity } from '~svc/core/src/user/entities/payment-gateway.entity';
import { UserEntity } from '~svc/core/src/user/entities/user.entity';

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
  payment_gateway: PaymentGatewayEntity;

  @OneToMany(() => UserEntity, (user) => user.country)
  users: UserEntity[];
}
