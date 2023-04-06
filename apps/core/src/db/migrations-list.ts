import { createUserTable1669901299726 } from './migrations/1669901299726-create-user-table';
import { AlterUsersTable2167043583659 } from './migrations/1670435836592-AlterUsersTable';
import { CreateCountriesTable1671025190389 } from './migrations/1671085183650-CreateCountriesTable';
import { AlterUsersTable1671025295745 } from './migrations/1671085206872-AlterUsersTable';
import { CreatePrimeTrustTable1671090646320 } from './migrations/1671090646320-CreatePrimeTrustTable';
import { createUserDetailsTable1671438132874 } from './migrations/1671438132874-createUserDetailsTable';
import { CreatePrimeTrustAccount1671467664497 } from './migrations/1671467664497-CreatePrimeTrustAccount';
import { FixTypesAndRelations1671733995143 } from './migrations/1671733995143-FixTypesAndRelations';
import { CreateKYCTables1671868325708 } from './migrations/1671868325708-CreateKYCTables';
import { AlterKycTable1671874610946 } from './migrations/1671874610946-AlterKycTable';
import { AlterUserTableForSDKRegistration1671971668825 } from './migrations/1671971668825-AlterUserTableForSDKRegistration';
import { CreateBalanceTable1672139130150 } from './migrations/1672139130150-CreateBalanceTable';
import { CreateWithdrawalTables1672311919236 } from './migrations/1672311919236-CreateWithdrawalTables';
import { AlterWithdrawalTable1672312373374 } from './migrations/1672312373374-AlterWithdrawalTable';
import { CreateNotificationsTable1672737767969 } from './migrations/1672737767969-CreateNotificationsTable';
import { AlterUsersTable1672920595456 } from './migrations/1672920595456-AlterUsersTable';
import { AddUserContactTable1673371635929 } from './migrations/1673371635929-AddUserContactTable';
import { AlterUsersTable1674119775903 } from './migrations/1674119775903-AlterUsersTable';
import { ChangeLogic1674544963817 } from './migrations/1674544963817-ChangeLogic';
import { DropPrimeUsers1674545919902 } from './migrations/1674545919902-DropPrimeUsers';
import { CardResourceTable1675331507769 } from './migrations/1675331507769-CardResourceTable';
import { CreateTransferFundsTable1675409446505 } from './migrations/1675409446505-CreateTransferFundsTable';
import { CreateBankAccountsTable1675444112418 } from './migrations/1675444112418-CreateBankAccountsTable';
import { AlterWithdrawalParamsTable1675502524716 } from './migrations/1675502524716-AlterWithdrawalParamsTable';
import { AlterBankAccountsTable1675669007472 } from './migrations/1675669007472-AlterBankAccountsTable';
import { CreateDepositParamsTable1675752900884 } from './migrations/1675752900884-CreateDepositParamsTable';
import { AddPhoneUniqueContraint1675781764778 } from './migrations/1675781764778-AddPhoneUniqueContraint';
import { MakeUserPhoneNullable1675855993341 } from './migrations/1675855993341-MakeUserPhoneNullable';
import { AlterCardResourceTable1676270704886 } from './migrations/1676270704886-AlterCardResourceTable';
import { AlterTransferFundsTable1676353129263 } from './migrations/1676353129263-AlterTransferFundsTable';
import { AlterTransfersTable1676796180024 } from './migrations/1676796180024-AlterTransfersTable';
import { AddAvatarToUserDetails1677061588614 } from './migrations/1677061588614-AddAvatarToUserDetails';
import { AlterBalanceTable1677138110571 } from './migrations/1677138110571-AlterBalanceTable';
import { AlterBankAccountTable1677664281088 } from './migrations/1677664281088-AlterBankAccountTable';
import { RemoveCountryEntity1678111485298 } from './migrations/1678111485298-RemoveCountryEntity';
import { RemoveUsername1678630767390 } from './migrations/1678630767390-RemoveUsername';
import { AlterUsersTable1679033609244 } from './migrations/1679033609244-AlterUsersTable';
import { AlterTransfersTable1680249255329 } from './migrations/1680249255329-AlterTransfersTable';
import { CreateKycTable1680787242455 } from './migrations/1680787242455-CreateKycTable';

export default [
  createUserTable1669901299726,
  AlterUsersTable2167043583659,
  CreateCountriesTable1671025190389,
  AlterUsersTable1671025295745,
  CreatePrimeTrustTable1671090646320,
  createUserDetailsTable1671438132874,
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
  CardResourceTable1675331507769,
  CreateTransferFundsTable1675409446505,
  CreateBankAccountsTable1675444112418,
  AlterWithdrawalParamsTable1675502524716,
  AlterBankAccountsTable1675669007472,
  CreateDepositParamsTable1675752900884,
  AddPhoneUniqueContraint1675781764778,
  MakeUserPhoneNullable1675855993341,
  AlterCardResourceTable1676270704886,
  AlterTransferFundsTable1676353129263,
  AlterTransfersTable1676796180024,
  AlterBalanceTable1677138110571,
  AddAvatarToUserDetails1677061588614,
  AlterBankAccountTable1677664281088,
  RemoveCountryEntity1678111485298,
  RemoveUsername1678630767390,
  AlterUsersTable1679033609244,
  AlterTransfersTable1680249255329,
  CreateKycTable1680787242455,
];
