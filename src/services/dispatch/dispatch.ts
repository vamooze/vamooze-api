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
import userRoles from  '../../helpers/permissions'
import { ApprovalStatus} from './dispatch.schema'

export * from "./dispatch.class";
export * from "./dispatch.schema";


const checkDispatchOwnership = async (context: any) => {
 
  const dispatch = await context.app.service('dispatch').get(context.arguments[0]);
  console.log( dispatch , context.arguments[0] ,   context.params.user)

  // if (dispatch.user_id !== context.params.user?.id) {
  //   throw new Forbidden('You do not have permission to view this dispatch');
  // }

  return context;
};

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
      find: [
        checkPermission(userRoles.superAdmin),
      ],
      get: [
        checkPermission(userRoles.superAdminAndDispatch),
        checkDispatchOwnership
      ],
      create: [
        async (context) => {
          const { app } = context;
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
            approval_status: ApprovalStatus.PENDING
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
