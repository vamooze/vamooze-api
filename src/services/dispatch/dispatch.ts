// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from "@feathersjs/authentication";
import { NotFound, Forbidden, Conflict } from "@feathersjs/errors";
import { hooks as schemaHooks } from "@feathersjs/schema";

import {
  dispatchDataValidator,
  dispatchPatchValidator,
  dispatchQueryValidator,
  dispatchResolver,
  dispatchExternalResolver,
  dispatchDataResolver,
  dispatchPatchResolver,
  dispatchQueryResolver,
} from "./dispatch.schema";

import type { Application } from "../../declarations";
import { DispatchService, getOptions } from "./dispatch.class";
import { dispatchPath, dispatchMethods } from "./dispatch.shared";
import { checkPermission } from '../../helpers/checkPermission'
const userRoles = require('../../helpers/permissions.json')



export * from "./dispatch.class";
export * from "./dispatch.schema";



// A configure function that registers the service and its hooks via `app.configure`
export const dispatch = (app: Application) => {
  // Register our service on the Feathers application
  app.use(dispatchPath, new DispatchService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: ["find", "get", "create", "patch", "remove", "approveRider"],
    // You can add additional custom events to be sent to clients here
    events: [],
  });
  // Initialize hooks
  app.service(dispatchPath).hooks({
    before: {
      all: [
        authenticate("jwt"),
        schemaHooks.validateQuery(dispatchQueryValidator),
        schemaHooks.resolveQuery(dispatchQueryResolver),
      ],
      find: [checkPermission(userRoles.allAdmin)],
      get: [],
      create: [
        async (context) => {
          const { app, data, } = context;
          const existingDispatch = await app.service("dispatch").find({
            query: {
              //@ts-ignore
              user_id: context.params.user.id,
            },
          });

          if (existingDispatch.total > 0) {
            throw new Conflict("User already has a dispatch record.",);
          }
          context.data = {
            ...context.data,
            //@ts-ignore
            user_id: context?.params?.user?.id,
          };
          return context;
        },
        schemaHooks.validateData(dispatchDataValidator),
        schemaHooks.resolveData(dispatchDataResolver),
        async (context) => {
          context.data = {
            ...context.data,
            //@ts-ignore
            preferred_delivery_locations: JSON.stringify(context?.data?.preferred_delivery_locations),
          };
          return context;
        },
      ],
      patch: [
        schemaHooks.validateData(dispatchPatchValidator),
        schemaHooks.resolveData(dispatchPatchResolver),
      ],
      remove: [],
      approveRider: [],
    },
    after: {
      all: [],
    },
    error: {
      all: [],
    },
  });
};

// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    [dispatchPath]: DispatchService;
  }
}
