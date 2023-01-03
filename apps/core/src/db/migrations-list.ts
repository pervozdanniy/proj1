import { CreateCountriesTable1671025190389 } from '~svc/core/src/db/migrations/1671085183650-CreateCountriesTable';
import { AlterUsersTable1671025295745 } from '~svc/core/src/db/migrations/1671085206872-AlterUsersTable';
import { CreatePrimeTrustTable1671090646320 } from '~svc/core/src/db/migrations/1671090646320-CreatePrimeTrustTable';
import { createUserDetailsTable1671438132874 } from '~svc/core/src/db/migrations/1671438132874-createUserDetailsTable';
import { CreatePrimeTrustAccount1671467664497 } from '~svc/core/src/db/migrations/1671467664497-CreatePrimeTrustAccount';
import { CreateKYCTables1671868325708 } from '~svc/core/src/db/migrations/1671868325708-CreateKYCTables';
import { AlterKycTable1671874610946 } from '~svc/core/src/db/migrations/1671874610946-AlterKycTable';
import { CreateBalanceTable1672139130150 } from '~svc/core/src/db/migrations/1672139130150-CreateBalanceTable';
import { CreateWithdrawalTables1672311919236 } from '~svc/core/src/db/migrations/1672311919236-CreateWithdrawalTables';
import { AlterWithdrawalTable1672312373374 } from '~svc/core/src/db/migrations/1672312373374-AlterWithdrawalTable';
import { CreateNotificationsTable1672737767969 } from '~svc/core/src/db/migrations/1672737767969-CreateNotificationsTable';
import { SeedPaymentGateway1671466516817 } from '~svc/core/src/db/seeds/1671466516817-SeedPaymentGateway';
import { createUserTable1669901299726 } from './migrations/1669901299726-create-user-table';
import { AlterUsersTable2167043583659 } from './migrations/1670435836592-AlterUsersTable';
import { FixTypesAndRelations1671733995143 } from './migrations/1671733995143-FixTypesAndRelations';
import { AlterUserTableForSDKRegistration1671971668825 } from './migrations/1671971668825-AlterUserTableForSDKRegistration';

export default [
  createUserTable1669901299726,
  AlterUsersTable2167043583659,
  CreateCountriesTable1671025190389,
  AlterUsersTable1671025295745,
  CreatePrimeTrustTable1671090646320,
  createUserDetailsTable1671438132874,
  SeedPaymentGateway1671466516817,
  CreatePrimeTrustAccount1671467664497,
  FixTypesAndRelations1671733995143,
  CreateKYCTables1671868325708,
  AlterKycTable1671874610946,
  CreateBalanceTable1672139130150,
  AlterUserTableForSDKRegistration1671971668825,
  CreateWithdrawalTables1672311919236,
  AlterWithdrawalTable1672312373374,
  CreateNotificationsTable1672737767969,
];
