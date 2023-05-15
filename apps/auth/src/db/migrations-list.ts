import { CreateAuthClient1671735244980 } from './migrations/1671735244980-CreateAuthClient';
import { Create2FASettingsTable1674149141499 } from './migrations/1674149141499-Create2FASettingsTable';
import { Alter2FARequireDestination1678273366673 } from './migrations/1678273366673-Alter2FARequireDestination';
import { CreateRefreshTokenEntity1680877145270 } from './migrations/1680877145270-CreateRefreshTokenEntity';
import { AlterAuthTable1681216028527 } from './migrations/1681216028527-AlterAuthTable';

export default [
  CreateAuthClient1671735244980,
  Create2FASettingsTable1674149141499,
  Alter2FARequireDestination1678273366673,
  AlterAuthTable1681216028527,
  CreateRefreshTokenEntity1680877145270,
];
