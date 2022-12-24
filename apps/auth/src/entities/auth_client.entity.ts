import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('auth_client')
export class AuthClient {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('varchar')
  name: string;

  @Column('varchar')
  key: string;

  @Column('varchar', { nullable: true })
  secret?: string;
}
