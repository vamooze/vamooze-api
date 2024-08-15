// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from "@feathersjs/authentication";
import { NotFound, Forbidden, Conflict } from "@feathersjs/errors";
import { HookContext } from "@feathersjs/feathers";
import { hooks as schemaHooks } from "@feathersjs/schema";
import { Roles, DispatchApprovalStatus } from "../../interfaces/constants";
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
import { checkPermission } from "../../helpers/checkPermission";
import userRoles from "../../helpers/permissions";
import { ApprovalStatus } from "./dispatch.schema";

export * from "./dispatch.class";
export * from "./dispatch.schema";

///********************************hooks***************///

const checkDispatchOwnership = async (context: HookContext) => {
  const id = context?.id;
  const userId = context.params.user?.id;

  if (!id) {
    throw new NotFound(`No dispatch found with id ${id}`);
  }

  const dispatch = await context.app
    .service("dispatch") //@ts-ignore
    .find({ query: { id: id } });

  if (dispatch?.total === 0) {
    throw new NotFound(`No dispatch found with id ${id}`);
  }

   const userRoleData = await context.app.service('roles').find({ query: { id: context.params.user.role } });

   const userRole = userRoleData.data[0].slug

  if (dispatch.data[0].user_id !== userId && userRole !== Roles.SuperAdmin) {
    throw new Forbidden("You do not have permission to view this dispatch");
  }


  return context;
};

const addUserInfo = async (context: HookContext) => {

  const { app, method, result } = context;

  const addUserToDispatch = async (dispatch: any) => {
    const user = await app.service('users').get(dispatch.user_id);
    return {
      ...dispatch,
      phone_number: user.phone_number,
      first_name: user.first_name,
      last_name: user.last_name
    };
  };

  if (method === 'get') {
    if (result) {
      context.result = await addUserToDispatch(result);
    }
  } else if (method === 'find') {
    if (result.data) {
      context.result.data = await Promise.all(result.data.map(addUserToDispatch));
    }
  }

  return context;
};

///********************************hooks***************///

// A configure function that registers the service and its hooks via `app.configure`
export const dispatch = (app: Application) => {

  app.use(dispatchPath, new DispatchService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: ["find", "get", "create", "patch", "remove"],
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
      find: [checkPermission(userRoles.superAdmin)],
      get: [
        checkDispatchOwnership,
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
            throw new Conflict("User already has a dispatch record.");
          }
          context.data = {
            ...context.data,
            //@ts-ignore
            user_id: context?.params?.user?.id,
            approval_status: ApprovalStatus.PENDING,
          };
          return context;
        },
        schemaHooks.validateData(dispatchDataValidator),
        schemaHooks.resolveData(dispatchDataResolver),
        async (context) => {
          context.data = {
            ...context.data,
            //@ts-ignore
            preferred_delivery_locations: JSON.stringify(
              //@ts-ignore
              context?.data?.preferred_delivery_locations
            ),
          };
          return context;
        },
      ],
      patch: [
        schemaHooks.validateData(dispatchPatchValidator),
        schemaHooks.resolveData(dispatchPatchResolver),
      ],
      remove: [],
    },
    after: {
      all: [],
      get: [addUserInfo],
      find: [addUserInfo],
    },
    error: {
      all: [],
    },
  });

  //@ts-ignore
  app.patch("/dispatch-approve/:dispatchId", async (req, res) => {
    try {
      const id = req.params.dispatchId;

      const Dispatch = app.service("dispatch");
      const dispatchDetais = await Dispatch.find({
        query: {
          id,
        },
      });

      if (dispatchDetais?.data.length === 0) {
        return res.status(404).json({
          status: 404,
          message: "User not found",
          success: false
        });
      }

     //@ts-ignore
      await app
        .service("dispatch")
         //@ts-ignore
        .patch(dispatchDetais?.data[0]?.id, {
          approval_status: DispatchApprovalStatus.approved,
        });

      return res.json({
        status: 200,
        message: "Dispatch Approved succesfully",
        success: true,
      });
    } catch (error) {
      return res.json({
        status: 401,
        message: "Dispatch Approval failed ",
        success: false,
      });
    }
  });

 //@ts-ignore
  app.patch("/dispatch/toggle-suspension/:dispatchId", async (req, res) => {

    try {
      const id = req.params.dispatchId;

      const Dispatch = app.service("dispatch");
      const dispatchDetails = await Dispatch.find({
        query: {
          id,
        },
      });

      if (dispatchDetails.data.length === 0) {
        return res.status(404).json({
          status: 404,
          message: "Dispatch not found",
          success: false
        });
      }

      const currentDispatch = dispatchDetails.data[0];
      const newSuspendedStatus = !currentDispatch.suspended;

       //@ts-ignore
      await Dispatch.patch(currentDispatch.id, {
        suspended: newSuspendedStatus,
        // suspended_at: newSuspendedStatus ? new Date().toISOString() : null,
        // suspended_by: newSuspendedStatus ? req.user.id : null, // Assuming you have user information in the request
      });

      return res.json({
        status: 200,
        message: newSuspendedStatus ? "Dispatch suspended successfully" : "Dispatch unsuspended successfully",
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Failed to toggle dispatch suspension",
        success: false,
      });
    }
  });

};

// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    [dispatchPath]: DispatchService;
  }
}
