import { config } from 'dotenv';
import * as _ from 'lodash';
import { Connection, In } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { HashHelper } from '../../helpers/hash.helper';
import { PermissionEntity } from '../../modules/admin/access/permissions/permission.entity';
import { RoleEntity } from '../../modules/admin/access/roles/role.entity';
import { UserStatus } from '../../modules/admin/access/users/user-status.enum';
import { UserEntity } from '../../modules/admin/access/users/user.entity';

config();
const users = [
  {
    firstName: 'Admin',
    lastName: 'Admin',
    password: process.env.ADMIN_PANEL_PASSWORD,
    username: process.env.ADMIN_PANEL_USERNAME,
    isSuperUser: true,
    status: UserStatus.Active,
  },
];

const rolePermissions: { name: string; slug: string; permissions: { slug: string; description: string }[] }[] = [
  {
    name: 'Developer',
    slug: 'developer',
    permissions: [
      { slug: 'admin.access.users.read', description: 'Read users' },
      { slug: 'admin.access.users.create', description: 'Create users' },
      { slug: 'admin.access.users.update', description: 'Update users' },
      { slug: 'admin.access.roles.read', description: 'Read Roles' },
      { slug: 'admin.access.roles.create', description: 'Create Roles' },
      { slug: 'admin.access.roles.update', description: 'Update Roles' },
      { slug: 'admin.access.permissions.read', description: 'Read permissions' },
      {
        slug: 'admin.access.permissions.create',
        description: 'Create permissions',
      },
      {
        slug: 'admin.access.permissions.update',
        description: 'Update permissions',
      },
    ],
  },
  {
    name: 'Admin',
    slug: 'admin',
    permissions: [
      { slug: 'admin.access.users.read', description: 'Read users' },
      { slug: 'admin.access.users.create', description: 'Create users' },
      { slug: 'admin.access.users.update', description: 'Update users' },
      { slug: 'admin.access.roles.read', description: 'Read Roles' },
      { slug: 'admin.access.roles.create', description: 'Create Roles' },
      { slug: 'admin.access.roles.update', description: 'Update Roles' },
    ],
  },
];

export default class CreateUsersSeed implements Seeder {
  public async run(_factory: Factory, connection: Connection): Promise<any> {
    const permissions = _.uniqBy(
      rolePermissions.reduce((acc, element) => {
        return acc.concat(...element.permissions);
      }, []),
      'slug',
    );
    // Getting slugs form permissions
    const permissionSlugs = permissions.map((p) => p.slug);
    // Getting existing permissions from the DB
    const existingPermissions = await connection.manager.find(PermissionEntity, {
      where: { slug: In(permissionSlugs) },
    });
    // Mapping all permissions to permission entities
    const validPermissions = permissions.map((p) => {
      const existing = existingPermissions.find((e) => e.slug === p.slug);
      if (existing) {
        return existing;
      }

      return new PermissionEntity(p);
    });
    // Creating / updating permissions
    const savedPermissions: Record<string, PermissionEntity> = (await connection.manager.save(validPermissions)).reduce(
      (acc, p) => {
        return { ...acc, [p.slug]: p };
      },
      {},
    );

    // Creating roles
    const roles = rolePermissions.map(({ name, slug, permissions }) => {
      const permissionsPromise = Promise.resolve(permissions.map((p) => savedPermissions[p.slug]));

      return new RoleEntity({ name, permissions: permissionsPromise, slug });
    });
    const savedRoles = await connection.manager.save(roles);
    //Creating users
    const entities = await Promise.all(
      users.map(async (u) => {
        const roles = Promise.resolve(savedRoles);
        const password = await HashHelper.encrypt(u.password);
        const user = new UserEntity({ ...u, password, roles });

        return user;
      }),
    );
    await connection.manager.save(entities);
  }
}
