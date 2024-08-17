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
import { successResponse } from "../../helpers/functions";

export * from "./dispatch.class";
export * from "./dispatch.schema";

///********************************hooks***************///

const addUserInfo = async (context: HookContext) => {
  const { app, method, result } = context;

  const addUserToDispatch = async (dispatch: any) => {
    const user = await app.service("users").get(dispatch.user_id);
    return {
      ...dispatch,
      phone_number: user.phone_number,
      first_name: user.first_name,
      last_name: user.last_name,
    };
  };

  if (method === "get") {
    if (result) {
      context.result = await addUserToDispatch(result);
    }
  } else if (method === "find") {
    if (result.data) {
      context.result.data = await Promise.all(
        result.data.map(addUserToDispatch)
      );
    }
  }

  return context;
};

const dispatchDetails = "Disptach Details"
const quizData = [
  {
    id: "q001",
    questionNumber: 1,
    text: "What's the Capital of Ivory Coast",
    type: "multiple_choice",
    options: [
      {
        id: "a",
        text: "Abuja",
      },
      {
        id: "b",
        text: "Yamoussoukro",
      },
      {
        id: "c",
        text: "Accra",
      },
      {
        id: "d",
        text: "Abidjan",
      },
    ],
    correctAnswer: "b",
  },
  {
    id: "q002",
    questionNumber: 2,
    text: "What is the maximum weight a dispatch rider can carry?",
    type: "multiple_choice",
    options: [
      {
        id: "a",
        text: "20 kg",
      },
      {
        id: "b",
        text: "30 kg",
      },
      {
        id: "c",
        text: "40 kg",
      },
      {
        id: "d",
        text: "50 kg",
      },
    ],
    correctAnswer: "c",
  },
  {
    id: "q003",
    questionNumber: 3,
    text: "What should you do if a customer is not available to receive their package?",
    type: "multiple_choice",
    options: [
      {
        id: "a",
        text: "Leave the package at the door",
      },
      {
        id: "b",
        text: "Return the package to the depot",
      },
      {
        id: "c",
        text: "Call the customer and wait for 15 minutes",
      },
      {
        id: "d",
        text: "Give the package to a neighbor",
      },
    ],
    correctAnswer: "c",
  },
];

///********************************hooks***************///

// A configure function that registers the service and its hooks via `app.configure`
export const dispatch = (app: Application) => {
  app.use(dispatchPath, new DispatchService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: ["find", "get", "create", "patch", "remove"],
    // You can add additional custom events to be sent to clients here
    events: [],
  });

  app.service("dispatch").hooks({
    before: {
      all: [
        authenticate("jwt"),
        schemaHooks.validateQuery(dispatchQueryValidator),
        schemaHooks.resolveQuery(dispatchQueryResolver),
      ],
      find: async (context) => {
        const user = context.params.user; // Get authenticated user from context

        if (!user) return;

        //@ts-ignore
        const userRole = await app
          .service("roles")
          //@ts-ignore
          .get(context.params.user.role);

        if (userRole.slug !== Roles.SuperAdmin) {
          context.params.query = {
            user_id: user.id,
          };
        }
        return context;
      },
      patch: [
        schemaHooks.validateData(dispatchPatchValidator),
        schemaHooks.resolveData(dispatchPatchResolver),
        checkPermission(userRoles.superAdmin),
        async (context) => {
          const user = context.params.user;
          if(!user) return context

          //@ts-ignore
          const userRole = await app.service("roles").get(user.role);

         
      

           //@ts-ignore
          const { suspended, approval_status } = context.data;

          console.log( suspended, approval_status, context.id)

          // Handle suspension toggle
          if (suspended !== undefined) {
             //@ts-ignore
            context.data.suspended_at = suspended ? new Date().toISOString() : null;
           //@ts-ignore
            context.data.suspended_by = suspended ? user.id : null;
          }

  
          if (approval_status !== undefined) {
            if (!Object.values(ApprovalStatus).includes(approval_status)) {
              throw new Error('Invalid approval status');
            }
             //@ts-ignore
            context.data.approved_by = user.id;
             //@ts-ignore
            context.data.approval_date = new Date().toISOString();
          }

          return context;
        }
      ],
      get: [checkPermission(userRoles.superAdmin)],
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
    },
    after: {
      find: [
        addUserInfo,
        async (context) => {
          //@ts-ignore
          context.result = successResponse(
            //@ts-ignore
            context.result.data,
            200,
            dispatchDetails
          );
        },
      ],
      get: [
        addUserInfo,
        async (context) => {
          //@ts-ignore
          context.result = successResponse(
            //@ts-ignore
            context.result,
            200,
            dispatchDetails
          );
        },
      ],
    },
    error: {
      all: [],
      find: [],
    },
  });
  

  // @ts-ignore
  app.get("/dispatch-onboarding-quiz", async (req, res) => {
    try {
      return res.status(404).json({
        status: 200,
        message: "Quiz Data",
        success: true,
        data: quizData,
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

};

// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    [dispatchPath]: DispatchService;
  }
}
