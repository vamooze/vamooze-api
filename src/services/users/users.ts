// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from "@feathersjs/authentication";
import {
  NotFound,
  BadRequest,
  Conflict,
  GeneralError,
  NotAuthenticated,
} from "@feathersjs/errors";
import { hooks as schemaHooks } from "@feathersjs/schema";
import {
  userDataValidator,
  userPatchValidator,
  userQueryValidator,
  userResolver,
  userExternalResolver,
  userDataResolver,
  userPatchResolver,
  userQueryResolver,
} from "./users.schema";
import type { Params } from "@feathersjs/feathers";
import { inhouseInviteValidator } from "../index";
import { Request, Response } from "express";

import { Application, HookContext } from "../../declarations";
import { UserService, getOptions } from "./users.class";
import { userPath, userMethods } from "./users.shared";
import { checkPermission } from "../../helpers/checkPermission";
import userRoles from "../../helpers/permissions";
import emailTemplates from "../../helpers/emailTemplates";
import { getOtp, isVerified, sendEmail } from "../../helpers/functions";
import { Roles, TemplateName, TemplateType } from "../../interfaces/constants";

const { protect, hashPassword } =
  require("@feathersjs/authentication-local").hooks;

export * from "./users.class";
export * from "./users.schema";

// A configure function that registers the service and its hooks via `app.configure`
export const user = (app: Application) => {
  const options = getOptions(app);
  app.use(userPath, new UserService(options, app), {
    // A list of all methods this service exposes externally
    methods: userMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  });
  // Initialize hooks
  app.service(userPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(userExternalResolver),
        schemaHooks.resolveResult(userResolver),
      ],
      find: [authenticate("jwt")],
      get: [authenticate("jwt")],
      create: [],
      update: [authenticate("jwt")],
      patch: [authenticate("jwt")],
      remove: [authenticate("jwt")],
    },
    before: {
      all: [
        schemaHooks.validateQuery(userQueryValidator),
        schemaHooks.resolveQuery(userQueryResolver),
      ],
      find: [authenticate("jwt")],
      get: [authenticate("jwt")],
      create: [
        schemaHooks.validateData(userDataValidator),
        schemaHooks.resolveData(userDataResolver),
        //   async (context: HookContext) => {
        //   const role = await context.app.service('roles').find({query: { $limit: 1,slug: 'asset-owner'}});
        //   const numb = getOtp();
        //   context.data = {
        //     ...context.data,
        //     otp: numb,
        //     role: role?.data[0]?.id
        //   }
        // }
      ],
      patch: [
        hashPassword("password"),
        authenticate("jwt"),
        schemaHooks.validateData(userPatchValidator),
        schemaHooks.resolveData(userPatchResolver),
      ],
      remove: [],
    },
    after: {
      all: [protect("pin", "password")],
      create: [
        async (context: HookContext) => {
          const role = await context.app
            .service("roles")
            .get(context.result.role);
          if (
            role.slug === Roles.AssetOwner ||
            role.slug === Roles.BusinessOwner ||
            role.slug === Roles.GuestUser
          ) {
            sendEmail({
              toEmail: context.result.email,
              subject: "Verify your email",
              templateData: emailTemplates.otp(context.result.otp),
              receiptName: `${context.result.first_name} ${context.result.last_name}`,
            });
          }
          context.result.otp = null;
          context.result.password = null;
        },
        protect("password"),
      ],
      find: [protect("password", "otp")],
      get: [protect("password", "otp")],
      update: [protect("password", "otp")],
      patch: [protect("password", "otp")],
      remove: [],
    },
    error: {
      all: [],
      create: [
        async (context) => {
          const err = Object.keys(context.error.errors);

          if (context.error.code === 409 && err.includes("email")) {
            throw new Conflict("This email has been used");
          }

          return context;
        },
      ],
    },
  });

  app //@ts-ignore
    .use(`${userPath}/unverified`, {
      find: async (params: Params) => {
        const userService = app.service(userPath);
        return await userService.findUnverified(params);
      },
    })
    .hooks({
      before: {
        find: [
          authenticate("jwt"),
          checkPermission(userRoles.allAdmin)
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
    // .hooks({
    //   before: {
    //     patch: [
    //       authenticate("jwt"),
    //       checkPermission(userRoles.allAdmin)
    //     ],
    //   },
    // });


    app //@ts-ignore
    .use(`${userPath}/invite`, {
      create: async (data: any, params: any) => {
        const userService = app.service(userPath);
        return await userService.inviteUser(data, params);
      },
    })
    // .hooks({
    //   before: {
    //     patch: [
    //       authenticate("jwt"),
    //       checkPermission(userRoles.allAdmin) //
    //     ],
    //   },
    // });
};

// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    [userPath]: UserService;
  }
}
