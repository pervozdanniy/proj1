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
import { AlterUsersTable1672920595456 } from '~svc/core/src/db/migrations/1672920595456-AlterUsersTable';
import { AlterUsersTable1674119775903 } from '~svc/core/src/db/migrations/1674119775903-AlterUsersTable';
import { ChangeLogic1674544963817 } from '~svc/core/src/db/migrations/1674544963817-ChangeLogic';
import { DropPrimeUsers1674545919902 } from '~svc/core/src/db/migrations/1674545919902-DropPrimeUsers';
import { CardResourceTable1675331507769 } from '~svc/core/src/db/migrations/1675331507769-CardResourceTable';
import { CreateTransferFundsTable1675409446505 } from '~svc/core/src/db/migrations/1675409446505-CreateTransferFundsTable';
import { CreateBankAccountsTable1675444112418 } from '~svc/core/src/db/migrations/1675444112418-CreateBankAccountsTable';
import { AlterWithdrawalParamsTable1675502524716 } from '~svc/core/src/db/migrations/1675502524716-AlterWithdrawalParamsTable';
import { AlterBankAccountsTable1675669007472 } from '~svc/core/src/db/migrations/1675669007472-AlterBankAccountsTable';
import { SeedPaymentGateway1671466516817 } from '~svc/core/src/db/seeds/1671466516817-SeedPaymentGateway';
import { createUserTable1669901299726 } from './migrations/1669901299726-create-user-table';
import { AlterUsersTable2167043583659 } from './migrations/1670435836592-AlterUsersTable';
import { FixTypesAndRelations1671733995143 } from './migrations/1671733995143-FixTypesAndRelations';
import { AlterUserTableForSDKRegistration1671971668825 } from './migrations/1671971668825-AlterUserTableForSDKRegistration';
import { AddUserContactTable1673371635929 } from './migrations/1673371635929-AddUserContactTable';
import { AddPhoneUniqueContraint1675781764778 } from './migrations/1675781764778-AddPhoneUniqueContraint';

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
  AlterUsersTable1672920595456,
  AddUserContactTable1673371635929,
  AlterUsersTable1674119775903,
  ChangeLogic1674544963817,
  DropPrimeUsers1674545919902,
<<<<<<< HEAD
  CardResourceTable1675331507769,
  CreateTransferFundsTable1675409446505,
  CreateBankAccountsTable1675444112418,
  AlterWithdrawalParamsTable1675502524716,
  AlterBankAccountsTable1675669007472,
=======
  AddPhoneUniqueContraint1675781764778,
>>>>>>> e96700e (SKOPA-311: moved session extending interfaces out of session module, extended session guard to respect pre-registration step, fixed typeorm migration generation issue, adjusted core file structure, added convenient path aliases for each service, added redis dependency to core docker container)
];
