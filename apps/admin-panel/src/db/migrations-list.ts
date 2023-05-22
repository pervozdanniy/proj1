import { EnableUuidOssp_1597941181251 } from './migrations/1602269134635-enable-uuid-ossp';
import { CreateAdminSchema_1602337241496 } from './migrations/1602337241496-create-admin-schema';
import { CreateUserStatusEnum1602340072549 } from './migrations/1602340072549-create-user-status-enum';
import { createPermissionsTable1609619240082 } from './migrations/1609619240082-create-permissions-table';
import { createRolesTable1609619240083 } from './migrations/1609619240083-create-roles-table';
import { CreateRolesPermissionsTable_1609619240084 } from './migrations/1609619240084-create-roles-permissions-table';
import { createUsersTable1610321042350 } from './migrations/1610321042350-create-users-table';
import { createUsersRolesTable1610321079178 } from './migrations/1610321079178-create-users-roles-table';
import { createUsersPermissionsTable1610321090667 } from './migrations/1610321090667-create-users-permissions-table';

export default [
  EnableUuidOssp_1597941181251,
  CreateAdminSchema_1602337241496,
  CreateUserStatusEnum1602340072549,
  createPermissionsTable1609619240082,
  createRolesTable1609619240083,
  CreateRolesPermissionsTable_1609619240084,
  createUsersTable1610321042350,
  createUsersRolesTable1610321079178,
  createUsersPermissionsTable1610321090667,
];
