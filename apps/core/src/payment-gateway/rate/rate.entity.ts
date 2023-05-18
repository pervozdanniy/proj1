import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('rates')
export class RateEntity {
  @PrimaryColumn({ type: 'int', generated: true })
  id: number;

  @Column('varchar', { length: 10 })
  currency: string;

  @Column('varchar', { length: 10 })
  rate: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
