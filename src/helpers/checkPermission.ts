import { NotFound, GeneralError, BadRequest, Forbidden } from '@feathersjs/errors';
import type { HookContext } from '../declarations'

export const checkPermission = (options: string | string[]) => {
  return async (context: HookContext) => {
    const { app, params } = context;
    if(params.user){
      const userRole = await app.service('roles').get(params.user.role);
      if (!options.includes(userRole.name) && !options.includes(userRole.slug)) {
        throw new Forbidden('You dont have the permission to access this route');
      }
    }
    return context;
  };
};
