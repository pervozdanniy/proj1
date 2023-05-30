import { config } from 'dotenv';
import * as _ from 'lodash';
import { In, MigrationInterface, QueryRunner } from 'typeorm';
import { PM } from '../../constants/permission/map.permission';
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

const rolePermissions: Record<string, { slug: string; description: string }[]> = {
  Developer: [
    { slug: PM.access.users.read, description: 'Read users' },
    { slug: PM.access.users.create, description: 'Create users' },
    { slug: PM.access.users.update, description: 'Update users' },
    { slug: PM.access.roles.read, description: 'Read Roles' },
    { slug: PM.access.roles.create, description: 'Create Roles' },
    { slug: PM.access.roles.update, description: 'Update Roles' },
    { slug: PM.access.permissions.read, description: 'Read permissions' },
    {
      slug: PM.access.permissions.create,
      description: 'Create permissions',
    },
    {
      slug: PM.access.permissions.update,
      description: 'Update permissions',
    },
  ],
  Admin: [
    { slug: PM.access.users.read, description: 'Read users' },
    { slug: PM.access.users.create, description: 'Create users' },
    { slug: PM.access.users.update, description: 'Update users' },
    { slug: PM.access.roles.read, description: 'Read Roles' },
    { slug: PM.access.roles.create, description: 'Create Roles' },
    { slug: PM.access.roles.update, description: 'Update Roles' },
  ],
};

export class SeedBaseData1685450848322 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.connect();

    const roleNames = Object.keys(rolePermissions);
    // Distinct permissions contained in all roles
    const permissions = _.uniqBy(
      roleNames.reduce((acc, roleName) => {
        return acc.concat(rolePermissions[roleName]);
      }, []),
      'slug',
    );
    // Getting slugs form permissions
    const permissionSlugs = permissions.map((p) => p.slug);
    // Getting existing permissions from the DB
    const existingPermissions = await queryRunner.manager.find(PermissionEntity, {
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
    const savedPermissions: Record<string, PermissionEntity> = (
      await queryRunner.manager.save(validPermissions)
    ).reduce((acc, p) => {
      return { ...acc, [p.slug]: p };
    }, {});

    // Creating roles
    const roles = roleNames.map((name) => {
      const permissions = Promise.resolve(rolePermissions[name].map((p) => savedPermissions[p.slug]));

      return new RoleEntity({ name, permissions });
    });
    const savedRoles = await queryRunner.manager.save(roles);
    //Creating users
    const entities = await Promise.all(
      users.map(async (u) => {
        const roles = Promise.resolve(savedRoles);
        const password = await HashHelper.encrypt(u.password);
        const user = new UserEntity({ ...u, password, roles });

        return user;
      }),
    );
    await queryRunner.manager.save(entities);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.delete(UserEntity, {});
    await queryRunner.manager.delete(RoleEntity, {});
    await queryRunner.manager.delete(PermissionEntity, {});
  }
}
