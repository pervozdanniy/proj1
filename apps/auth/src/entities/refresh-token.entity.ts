import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('refresh_token')
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number;

  @Column({ generated: false, length: 24 })
  family: string;
}
