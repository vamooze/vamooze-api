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

export * from "./dispatch.class";
export * from "./dispatch.schema";

const isAdmin = async (context: any) => {
  const { user } = context.params;
  if (!user || user.role !== 4) {
    // Assuming 4 is the role ID for admin
    throw new Forbidden("Only admins can perform this action");
  }
};

const customErrorHandler = (context: any) => {
  if (context.error instanceof Conflict) {
    const { message } = context.error;
    context.error = {
      success: false,
      code: 409,
      message,
      data: null
    };
  }
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
    around: {
      all: [
        authenticate("jwt"),
        schemaHooks.resolveExternal(dispatchExternalResolver),
        schemaHooks.resolveResult(dispatchResolver),
      ],
    },
    before: {
      all: [
        schemaHooks.validateQuery(dispatchQueryValidator),
        schemaHooks.resolveQuery(dispatchQueryResolver),
      ],
      find: [],
      get: [isAdmin],
      create: [
        async (context) => {
          const { app, data, res } = context;
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
        },
        schemaHooks.validateData(dispatchDataValidator),
        schemaHooks.resolveData(dispatchDataResolver),
        async (context) => {
          context.data = {
            ...context.data,
            //@ts-ignore
            preferred_delivery_locations: JSON.stringify(context?.data?.preferred_delivery_locations),
          };
        },
      ],
      patch: [
        schemaHooks.validateData(dispatchPatchValidator),
        schemaHooks.resolveData(dispatchPatchResolver),
      ],
      remove: [],
      approveRider: [isAdmin],
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
