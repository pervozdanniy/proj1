import { createUserTable1669901299726 } from './migrations/1669901299726-create-user-table';
import { AlterUsersTable2167043583659 } from './migrations/1670435836592-AlterUsersTable';
import { CreateCountriesTable1671025190389 } from '~svc/core/src/db/migrations/1671085183650-CreateCountriesTable';
import { AlterUsersTable1671025295745 } from '~svc/core/src/db/migrations/1671085206872-AlterUsersTable';
import { CreatePrimeTrustTable1671090646320 } from '~svc/core/src/db/migrations/1671090646320-CreatePrimeTrustTable';
import { createUserDetailsTable1671438132874 } from '~svc/core/src/db/migrations/1671438132874-createUserDetailsTable';
import { SeedPaymentGateway1671466516817 } from '~svc/core/src/db/seeds/1671466516817-SeedPaymentGateway';
import { CreatePrimeTrustAccount1671467664497 } from '~svc/core/src/db/migrations/1671467664497-CreatePrimeTrustAccount';
import { CreatePrimeTrustContactsTable1671540500585 } from '~svc/core/src/db/migrations/1671540500585-CreatePrimeTrustContactsTable';
import { CreatePrimeKYCDocuments1671549167781 } from '~svc/core/src/db/migrations/1671549167781-CreatePrimeKYCDocuments';

export default [
  createUserTable1669901299726,
  AlterUsersTable2167043583659,
  CreateCountriesTable1671025190389,
  AlterUsersTable1671025295745,
  CreatePrimeTrustTable1671090646320,
  createUserDetailsTable1671438132874,
  SeedPaymentGateway1671466516817,
  CreatePrimeTrustAccount1671467664497,
  CreatePrimeTrustContactsTable1671540500585,
  CreatePrimeKYCDocuments1671549167781,
];
