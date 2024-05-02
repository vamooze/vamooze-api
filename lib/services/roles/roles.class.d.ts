import type { Params } from '@feathersjs/feathers';
import { KnexService } from '@feathersjs/knex';
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex';
import type { Application } from '../../declarations';
import type { Roles, RolesData, RolesPatch, RolesQuery } from './roles.schema';
export type { Roles, RolesData, RolesPatch, RolesQuery };
export interface RolesParams extends KnexAdapterParams<RolesQuery> {
}
export declare class RolesService<ServiceParams extends Params = RolesParams> extends KnexService<Roles, RolesData, RolesParams, RolesPatch> {
}
export declare const getOptions: (app: Application) => KnexAdapterOptions;
