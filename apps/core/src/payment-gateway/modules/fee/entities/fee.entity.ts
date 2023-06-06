import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('fees')
export class FeeEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('char', { unique: true, length: 2, nullable: true })
  country: string;

  @Column('float', { default: 0 })
  percent: number;

  @Column('float', { nullable: true })
  fixed_usd?: number;
}
