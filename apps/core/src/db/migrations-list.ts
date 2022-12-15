import { createUserTable1669901299726 } from './migrations/1669901299726-create-user-table';
import { AlterUsersTable2167043583659 } from './migrations/1670435836592-AlterUsersTable';
import { CreateCountriesTable1671025190389 } from '~svc/core/src/db/migrations/1671085183650-CreateCountriesTable';
import { AlterUsersTable1671025295745 } from '~svc/core/src/db/migrations/1671085206872-AlterUsersTable';
import { CreatePrimeTrustTable1671090646320 } from '~svc/core/src/db/migrations/1671090646320-CreatePrimeTrustTable';

export default [
  createUserTable1669901299726,
  AlterUsersTable2167043583659,
  CreateCountriesTable1671025190389,
  AlterUsersTable1671025295745,
  CreatePrimeTrustTable1671090646320,
];
