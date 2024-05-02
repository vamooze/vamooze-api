import type { Params } from '@feathersjs/feathers';
import type { ClientApplication } from '../../client';
import type { Roles, RolesData, RolesPatch, RolesQuery, RolesService } from './roles.class';
export type { Roles, RolesData, RolesPatch, RolesQuery };
export type RolesClientService = Pick<RolesService<Params<RolesQuery>>, (typeof rolesMethods)[number]>;
export declare const rolesPath = "roles";
export declare const rolesMethods: readonly ["find", "get", "create", "patch", "remove"];
export declare const rolesClient: (client: ClientApplication) => void;
declare module '../../client' {
    interface ServiceTypes {
        [rolesPath]: RolesClientService;
    }
}
