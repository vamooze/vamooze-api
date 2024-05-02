import type { Application } from '../../declarations';
import { RolesService } from './roles.class';
import { rolesPath } from './roles.shared';
export * from './roles.class';
export * from './roles.schema';
export declare const roles: (app: Application) => void;
declare module '../../declarations' {
    interface ServiceTypes {
        [rolesPath]: RolesService;
    }
}
