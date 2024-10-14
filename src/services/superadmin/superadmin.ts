// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import type { Params } from "@feathersjs/feathers";
import type { Application } from '../../declarations'
import { SuperadminService, getOptions } from './superadmin.class'
import { superadminPath, superadminMethods } from './superadmin.shared'
import { checkPermission } from "../../helpers/checkPermission";
import userRoles from "../../helpers/permissions";
import { userPath, userMethods } from "../users/users.shared";

export * from './superadmin.class'

// A configure function that registers the service and its hooks via `app.configure`
export const superadmin = (app: Application) => {
  // Register our service on the Feathers application
  app.use(superadminPath, new SuperadminService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: superadminMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(superadminPath).hooks({
    around: {
      all: [authenticate('jwt')]
    },
    before: {
      all: [],
      find: [],
      get: [],
      create: [],
      patch: [],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })


  app //@ts-ignore
  .use(`users/unverified`, {
    find: async (params: Params) => {
      const userService = app.service("users");
      return await userService.findUnverified(params);
    },
  })
  .hooks({
    before: {
      find: [
        // authenticate("jwt"),
        // checkPermission(userRoles.allAdmin)
      ],
    },
  });

  app //@ts-ignore
  .use(`${userPath}/:id/suspend`, {
    patch: async (id: number, data: any, params: Params) => {
      const userService = app.service(userPath);
      return await userService.suspendUser(params);
    },
  })
  .hooks({
    before: {
      patch: [
        // authenticate("jwt"),
        // checkPermission(userRoles.allAdmin)
      ],
    },
  });

  app //@ts-ignore
  .use(`${userPath}/invite`, {
    create: async (data: any, params: any) => {
      const userService = app.service(userPath);
      return await userService.inviteUser(data, params);
    },
  })
  .hooks({
    before: {
      patch: [
        // authenticate("jwt"),
        // checkPermission(userRoles.allAdmin) //
      ],
    },
  });
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [superadminPath]: SuperadminService
  }
}
