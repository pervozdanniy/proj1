import { Column, Entity, PrimaryColumn } from 'typeorm';
import { TwoFactorMethod } from '~common/constants/auth';

export { TwoFactorMethod };

@Entity('two_factor_settings')
export class TwoFactorSettingsEntity {
  @PrimaryColumn({ type: 'int', generated: false })
  user_id: number;

  @PrimaryColumn({ type: 'varchar', length: 20, generated: false })
  method: TwoFactorMethod;

  @Column({ type: 'varchar', nullable: true })
  destination?: string;
}
